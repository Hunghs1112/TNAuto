// src/services/serviceApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

interface Service {
  id: string;
  name: string;
  description?: string;
  estimated_time?: string;
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

export const serviceApi = createApi({
  reducerPath: 'serviceApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
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
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;