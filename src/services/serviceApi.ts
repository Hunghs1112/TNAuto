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

interface GarageScopedServiceArg {
  id: number | string;
  garageCode?: string;
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
        if (!response.success || !response.data) throw new Error('Failed to fetch services');
        return response.data;
      },
    }),
    getServiceById: builder.query<GetServiceResponse, GarageScopedServiceArg>({
      query: ({ id, garageCode }) => {
        const normalizedGarageCode = (garageCode || '').trim();
        if (!normalizedGarageCode) {
          throw new Error('Missing garageCode for getServiceById');
        }

        return buildEndpointUrl('getServiceById', {
          garageCode: encodeURIComponent(normalizedGarageCode),
          id: id.toString(),
        });
      },
      providesTags: (result, error, { id }) => [{ type: 'Service' as const, id: id.toString() }],
      transformResponse: (response: GetServiceResponse) => {
        if (!response.success || !response.data) throw new Error('Failed to fetch service');
        return response;
      },
    }),
    createService: builder.mutation<{ id: string }, CreateServiceRequest>({
      query: (body) => ({ url: ENDPOINTS.createService.path, method: 'POST', body }),
      invalidatesTags: ['Service'],
      transformResponse: (response: { success: boolean; service_id: string; message: string }) => {
        if (!response.success) throw new Error('Failed to create service');
        return { id: response.service_id };
      },
    }),
    updateService: builder.mutation<void, { id: string; body: UpdateServiceRequest }>({
      query: ({ id, body }) => ({ url: buildEndpointUrl('updateService', { id }), method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Service' as const, id }, 'Service'],
      transformResponse: (response: { success: boolean; message: string }) => {
        if (!response.success) throw new Error('Failed to update service');
      },
    }),
    deleteService: builder.mutation<void, string>({
      query: (id) => ({ url: buildEndpointUrl('deleteService', { id }), method: 'DELETE' }),
      invalidatesTags: ['Service'],
      transformResponse: (response: { success: boolean; message: string }) => {
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
