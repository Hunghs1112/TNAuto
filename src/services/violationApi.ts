// src/services/violationApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import { ApiResponse } from '../types/api.types';

export type ViolationStatus = 'pending' | 'violation' | 'no_violation' | 'check_error';

export interface VehicleViolation {
  vehicle_id: number;
  license_plate: string;
  violation_status: ViolationStatus;
  violation_count: number;
  checked_at: string | null;
}

export interface ViolationSummaryItem extends VehicleViolation {
  model?: string | null;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
}

export interface ViolationSummaryResponse {
  success: boolean;
  data: ViolationSummaryItem[];
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpsertViolationRequest {
  vehicleId: string | number;
  violation_status: ViolationStatus;
  violation_count?: number;
  checked_at?: string | null;
}

export const violationApi = createApi({
  ...API_CONFIG,
  reducerPath: 'violationApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Violation'] as const,
  endpoints: (builder) => ({
    // Customer: lấy trạng thái phạt nguội của xe theo vehicleId
    getCustomerVehicleViolation: builder.query<VehicleViolation, string | number>({
      query: (vehicleId) => `/api/app/customer/vehicles/${encodeURIComponent(String(vehicleId))}/violation`,
      providesTags: (result, error, vehicleId) => [{ type: 'Violation' as const, id: `customer:${vehicleId}` }],
      transformResponse: (response: any): VehicleViolation => {
        const d = response?.data ?? response;
        return {
          vehicle_id: d.vehicle_id,
          license_plate: d.license_plate ?? '',
          violation_status: d.violation_status ?? 'pending',
          violation_count: d.violation_count ?? 0,
          checked_at: d.checked_at ?? null,
        };
      },
    }),
  }),
});

export const { useGetCustomerVehicleViolationQuery } = violationApi;
