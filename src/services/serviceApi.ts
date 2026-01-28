// src/services/serviceApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';

interface Service {
  id: string;
  name: string;
  description?: string;
  estimated_time?: string | number; // giây
  warranty_period?: number | null; // Thời gian bảo hành (giây) - có thể null nếu không có bảo hành
  image_url?: string;
}

interface CreateServiceRequest {
  name: string;
  description?: string;
  estimated_time?: string;
  image_url?: string;
}

interface UpdateServiceRequest {
  name?: string;
  description?: string;
  estimated_time?: string;
  image_url?: string;
}

interface GetServiceResponse {
  success: boolean;
  data: Service;
}

export const serviceApi = createApi({
  ...API_CONFIG,
  reducerPath: 'serviceApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Service'] as const,
  endpoints: (builder) => ({
    getServicesAdmin: builder.query<Service[], void>({
      query: () => ENDPOINTS.getServicesAdmin.path,
      providesTags: ['Service'],
      transformResponse: (response: { success: boolean; data: Service[]; count: number }) => {
        console.log('serviceApi: getServicesAdmin response:', response); // Debug
        if (!response.success || !response.data) throw new Error('Failed to fetch services');
        return response.data;
      },
    }),
    getServiceById: builder.query<GetServiceResponse, number | string>({
      query: (id) => buildEndpointUrl('getServiceById', { id: id.toString() }),
      providesTags: (result, error, id) => [{ type: 'Service' as const, id: id.toString() }],
      transformResponse: (response: GetServiceResponse) => {
        console.log('serviceApi: getServiceById response:', response); // Debug
        if (!response.success || !response.data) throw new Error('Failed to fetch service');
        return response;
      },
    }),
    createService: builder.mutation<{ id: string }, CreateServiceRequest>({
      query: (body) => ({ url: ENDPOINTS.createService.path, method: 'POST', body }),
      invalidatesTags: ['Service'],
      transformResponse: (response: { success: boolean; service_id: string; message: string }) => {
        console.log('serviceApi: createService response:', response); // Debug
        if (!response.success) throw new Error('Failed to create service');
        return { id: response.service_id };
      },
    }),
    updateService: builder.mutation<void, { id: string; body: UpdateServiceRequest }>({
      query: ({ id, body }) => ({ url: buildEndpointUrl('updateService', { id }), method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Service' as const, id }, 'Service'],
      transformResponse: (response: { success: boolean; message: string }) => {
        console.log('serviceApi: updateService response:', response); // Debug
        if (!response.success) throw new Error('Failed to update service');
      },
    }),
    deleteService: builder.mutation<void, string>({
      query: (id) => ({ url: buildEndpointUrl('deleteService', { id }), method: 'DELETE' }),
      invalidatesTags: ['Service'],
      transformResponse: (response: { success: boolean; message: string }) => {
        console.log('serviceApi: deleteService response:', response); // Debug
        if (!response.success) throw new Error('Failed to delete service');
      },
    }),
  }),
});

export const {
  useGetServicesAdminQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;