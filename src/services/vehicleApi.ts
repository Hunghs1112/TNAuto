// src/services/vehicleApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import { Vehicle, ApiResponse, ServiceOrder, VehicleDocumentFields } from '../types/api.types';

export interface GetVehiclesResponse extends ApiResponse<Vehicle[]> {
  count: number;
}

export interface VehicleWithOrders extends Vehicle {
  orders?: ServiceOrder[];
}

type CreateVehicleRequest = {
  customer_id: number | string;
  garage_code?: string | null;
  garage_id?: number | string | null;
  license_plate: string;
  model?: string | null;
  image_url?: string | null;
} & Partial<Omit<VehicleDocumentFields, 'inspection_status' | 'insurance_status'>>;

type UpdateVehicleRequest = {
  id: string;
  customer_id?: number | string;
  garage_code?: string | null;
  garage_id?: number | string | null;
  model?: string | null;
  image_url?: string | null;
} & Partial<Omit<VehicleDocumentFields, 'inspection_status' | 'insurance_status'>>;

export const vehicleApi = createApi({
  ...API_CONFIG,
  reducerPath: 'vehicleApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Vehicle'] as const,
  endpoints: (builder) => ({
    // Get customer vehicles
    getCustomerVehicles: builder.query<GetVehiclesResponse, { customer_id?: string; phone?: string } | void>({
      query: (params) => ({
        url: '/api/app/customer/vehicles',
        params,
      }),
      providesTags: ['Vehicle'],
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
    
    // Get vehicle by ID with orders
    getVehicleById: builder.query<VehicleWithOrders, string>({
      query: (id) => `/api/app/customer/vehicles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vehicle' as const, id }],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Failed to fetch vehicle');
      },
    }),
    
    // Search vehicles by license plate
    searchVehiclesByPlate: builder.query<GetVehiclesResponse, { garageCode: string; license_plate: string }>({
      query: ({ garageCode, license_plate }) => ({
        url: `/api/app/garages/${encodeURIComponent(garageCode)}/vehicles/search`,
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
    createVehicle: builder.mutation<ApiResponse<Vehicle>, CreateVehicleRequest & { garageCode: string }>({
      query: ({ garageCode, ...body }) => ({
        url: `/api/app/garages/${encodeURIComponent(garageCode)}/vehicles`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Vehicle'],
    }),
    
    // Update vehicle
    updateVehicle: builder.mutation<ApiResponse<Vehicle>, UpdateVehicleRequest & { garageCode: string }>({
      query: ({ id, garageCode, ...body }) => ({
        url: `/api/app/garages/${encodeURIComponent(garageCode)}/vehicles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle' as const, id }, 'Vehicle'],
    }),
    
    // Delete vehicle
    deleteVehicle: builder.mutation<ApiResponse<void>, { garageCode: string; id: string }>({
      query: ({ garageCode, id }) => ({
        url: `/api/app/garages/${encodeURIComponent(garageCode)}/vehicles/${id}`,
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
