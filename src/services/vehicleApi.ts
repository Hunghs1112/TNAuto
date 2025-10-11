// src/services/vehicleApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/config';
import { Vehicle, ApiResponse, ServiceOrder } from '../types/api.types';

export interface GetVehiclesResponse extends ApiResponse<Vehicle[]> {
  count: number;
}

export interface VehicleWithOrders extends Vehicle {
  orders?: ServiceOrder[];
}

export const vehicleApi = createApi({
  reducerPath: 'vehicleApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Vehicle'] as const,
  endpoints: (builder) => ({
    // Get customer vehicles
    getCustomerVehicles: builder.query<GetVehiclesResponse, { customer_id?: string; phone?: string }>({
      query: (params) => ({
        url: params.phone ? '/customers/vehicles' : '/vehicles',
        params,
      }),
      providesTags: ['Vehicle'],
      transformResponse: (response: any) => {
        console.log('getCustomerVehicles response:', response);
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data,
            count: response.count || response.data.length,
          };
        }
        return { success: false, data: [], count: 0 };
      },
    }),
    
    // Get vehicle by ID with orders
    getVehicleById: builder.query<VehicleWithOrders, string>({
      query: (id) => `/vehicles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vehicle' as const, id }],
      transformResponse: (response: any) => {
        console.log('getVehicleById response:', response);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Failed to fetch vehicle');
      },
    }),
    
    // Search vehicles by license plate
    searchVehiclesByPlate: builder.query<GetVehiclesResponse, string>({
      query: (license_plate) => ({
        url: '/vehicles/search',
        params: { license_plate },
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data,
            count: response.count || response.data.length,
          };
        }
        return { success: false, data: [], count: 0 };
      },
    }),
    
    // Create vehicle
    createVehicle: builder.mutation<ApiResponse<Vehicle>, { customer_id: number; license_plate: string; model?: string; image_url?: string }>({
      query: (body) => ({
        url: '/vehicles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Vehicle'],
    }),
    
    // Update vehicle
    updateVehicle: builder.mutation<ApiResponse<Vehicle>, { id: string; model?: string; image_url?: string }>({
      query: ({ id, ...body }) => ({
        url: `/vehicles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle' as const, id }, 'Vehicle'],
    }),
    
    // Delete vehicle
    deleteVehicle: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/vehicles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),
  }),
});

export const {
  useGetCustomerVehiclesQuery,
  useGetVehicleByIdQuery,
  useSearchVehiclesByPlateQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehicleApi;

