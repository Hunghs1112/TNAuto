// src/services/employeeApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import {
  Employee,
  ServiceOrder,
  LoginEmployeeResponse,
  ApiResponse,
  UpdateOrderStatusRequest,
} from '../types/api.types';

export const employeeApi = createApi({
  ...API_CONFIG,
  reducerPath: 'employeeApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Employee', 'ServiceOrder'] as const,
  endpoints: (builder) => ({
    loginEmployee: builder.mutation<LoginEmployeeResponse, { phone: string; password: string }>({
      query: (body) => ({ url: ENDPOINTS.loginEmployee.path, method: 'POST', body }),
    }),
    getEmployeeOrders: builder.query<ServiceOrder[], { status?: string }>({
      query: (params) => ({ url: ENDPOINTS.getEmployeeOrders.path, params }),
      providesTags: ['ServiceOrder'],
    }),
    getEmployeeOrderDetails: builder.query<ServiceOrder, string>({
      query: (id) => buildEndpointUrl('getEmployeeOrderDetails', { id }),
      providesTags: (result, error, id) => [{ type: 'ServiceOrder' as const, id }],
      transformResponse: (response: any) => {
        // Backend trả về { success: true, data: {...} } hoặc trực tiếp {...}
        if (response.success && response.data) {
          return {
            ...response.data,
            images: response.data.images || [],
          };
        }
        // Nếu backend trả về trực tiếp object
        return {
          ...response,
          images: response.images || [],
        };
      },
    }),
    getAssignedOrders: builder.query<ApiResponse<ServiceOrder[]>, { employee_id: string; status?: string }>({
      query: (params) => {
        return { url: ENDPOINTS.getAssignedOrders.path, params };
      },
      providesTags: ['ServiceOrder'],
      transformResponse: (response: any) => {
        
        // Backend có thể trả về array trực tiếp hoặc object với data
        if (Array.isArray(response)) {
          return { success: true, data: response };
        }
        
        // Nếu response đã có format ApiResponse
        if (response && typeof response === 'object' && 'success' in response) {
          return response;
        }
        
        // Nếu response có data property nhưng không có success
        if (response && response.data && Array.isArray(response.data)) {
          return { success: true, data: response.data };
        }
        
        console.warn('employeeApi: Unknown response format:', response);
        return { success: false, data: [], error: 'Unknown response format' };
      },
      transformErrorResponse: (response: any) => {
        console.error('employeeApi: getAssignedOrders error:', response);
        return response;
      },
    }),
    createEmployee: builder.mutation<{ id: string; employee: Employee }, { name: string; phone: string; password: string }>({
      query: (body) => ({ url: ENDPOINTS.createEmployee.path, method: 'POST', body }),
      invalidatesTags: ['Employee'],
    }),
    getEmployees: builder.query<Employee[], void>({
      query: () => ENDPOINTS.getEmployees.path,
      providesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation<Employee, { id: string; name?: string; phone?: string; password?: string }>({
      query: ({ id, ...body }) => ({ url: buildEndpointUrl('updateEmployee', { id }), method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Employee' as const, id }, 'Employee'],
    }),
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({ url: buildEndpointUrl('deleteEmployee', { id }), method: 'DELETE' }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployeeOrderStatus: builder.mutation<void, { id: string; status: string; employee_id: string }>({
      query: ({ id, ...body }) => {
        return { 
          url: buildEndpointUrl('updateEmployeeOrderStatus', { id }), 
          method: 'PUT', 
          body 
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'ServiceOrder' as const, id }, 'ServiceOrder'],
      transformResponse: (response: any) => {
        if (response && !response.success && response.error) {
          throw new Error(response.error || 'Failed to update order status');
        }
      },
      transformErrorResponse: (response: any) => {
        console.error('employeeApi: updateEmployeeOrderStatus error:', response);
        return response;
      },
    }),
  }),
});

export const {
  useLoginEmployeeMutation,
  useGetEmployeeOrdersQuery,
  useGetEmployeeOrderDetailsQuery,
  useGetAssignedOrdersQuery,
  useCreateEmployeeMutation,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeOrderStatusMutation,
} = employeeApi;

// Re-export types
export type { Employee, ServiceOrder, LoginEmployeeResponse } from '../types/api.types';