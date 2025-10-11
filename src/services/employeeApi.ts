// src/services/employeeApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';
import {
  Employee,
  ServiceOrder,
  LoginEmployeeResponse,
  ApiResponse,
  UpdateOrderStatusRequest,
} from '../types/api.types';

export const employeeApi = createApi({
  reducerPath: 'employeeApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
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
        console.log('getEmployeeOrderDetails response:', response); // Debug
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
      query: (params) => ({ url: ENDPOINTS.getAssignedOrders.path, params }),
      providesTags: ['ServiceOrder'],
      transformResponse: (response: any) => {
        // Backend có thể trả về array trực tiếp hoặc object với data
        if (Array.isArray(response)) {
          return { success: true, data: response };
        }
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
} = employeeApi;

// Re-export types
export type { Employee, ServiceOrder, LoginEmployeeResponse } from '../types/api.types';