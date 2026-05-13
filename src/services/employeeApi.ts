import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';
import {
  ApiResponse,
  Employee,
  LoginEmployeeResponse,
  ServiceOrder,
} from '../types/api.types';
import { extractPaginationMeta } from '../utils/paginationHelpers';

interface EmployeeOrdersResponse extends ApiResponse<ServiceOrder[]> {
  count?: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNextPage?: boolean;
}

interface ClaimEmployeeOrderResponse extends ApiResponse<{
  order_id: number | string;
  employee_id: number | string;
  status: string;
  source?: string;
}> {}

const normalizeOrdersResponse = (response: any): EmployeeOrdersResponse => {
  if (Array.isArray(response)) {
    return {
      success: true,
      data: response,
      count: response.length,
      total: response.length,
    };
  }

  if (response && typeof response === 'object' && 'success' in response) {
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : [],
    };
  }

  if (response && Array.isArray(response.data)) {
    const pagination = extractPaginationMeta(response);
    return {
      success: true,
      data: response.data,
      count: response.count ?? response.data.length,
      ...pagination,
    };
  }

  console.warn('employeeApi: Unknown orders response format:', response);
  return {
    success: false,
    data: [],
    error: 'Unknown response format',
  };
};

export const employeeApi = createApi({
  ...API_CONFIG,
  reducerPath: 'employeeApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Employee', 'ServiceOrder'] as const,
  endpoints: (builder) => ({
    loginEmployee: builder.mutation<LoginEmployeeResponse, { phone: string; password: string }>({
      query: (body) => ({
        url: ENDPOINTS.loginEmployee.path,
        method: 'POST',
        body,
      }),
    }),
    getEmployeeOrders: builder.query<ServiceOrder[], { status?: string }>({
      query: (params) => ({
        url: ENDPOINTS.getEmployeeOrders.path,
        params,
      }),
      providesTags: ['ServiceOrder'],
    }),
    getEmployeeOrderDetails: builder.query<ServiceOrder, string>({
      query: (id) => buildEndpointUrl('getEmployeeOrderDetails', { id }),
      providesTags: (result, error, id) => [{ type: 'ServiceOrder' as const, id }],
      transformResponse: (response: any) => {
        if (response?.success && response.data) {
          return {
            ...response.data,
            images: response.data.images || [],
          };
        }

        return {
          ...response,
          images: response?.images || [],
        };
      },
    }),
    getAssignedOrders: builder.query<EmployeeOrdersResponse, { employee_id: string; status?: string }>({
      query: (params) => ({
        url: ENDPOINTS.getAssignedOrders.path,
        params,
      }),
      providesTags: ['ServiceOrder'],
      transformResponse: normalizeOrdersResponse,
      transformErrorResponse: (response: any) => {
        console.error('employeeApi: getAssignedOrders error:', response);
        return response;
      },
    }),
    getAvailableOrders: builder.query<EmployeeOrdersResponse, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: ENDPOINTS.getAvailableEmployeeOrders.path,
        params,
      }),
      providesTags: ['ServiceOrder'],
      transformResponse: normalizeOrdersResponse,
      transformErrorResponse: (response: any) => {
        console.error('employeeApi: getAvailableOrders error:', response);
        return response;
      },
    }),
    claimEmployeeOrder: builder.mutation<ClaimEmployeeOrderResponse, { id: string; employee_id: string }>({
      query: ({ id, employee_id }) => ({
        url: buildEndpointUrl('claimEmployeeOrder', { id }),
        method: 'POST',
        body: { employee_id },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ServiceOrder' as const, id }, 'ServiceOrder'],
      transformResponse: (response: ClaimEmployeeOrderResponse) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to claim order');
        }

        return response;
      },
      transformErrorResponse: (response: any) => {
        console.error('employeeApi: claimEmployeeOrder error:', response);
        return response;
      },
    }),
    createEmployee: builder.mutation<{ id: string; employee: Employee }, { name: string; phone: string; password: string }>({
      query: (body) => ({
        url: ENDPOINTS.createEmployee.path,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getEmployees: builder.query<Employee[], void>({
      query: () => ENDPOINTS.getEmployees.path,
      providesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation<Employee, { id: string; name?: string; phone?: string; password?: string }>({
      query: ({ id, ...body }) => ({
        url: buildEndpointUrl('updateEmployee', { id }),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Employee' as const, id }, 'Employee'],
      transformResponse: (response: any) => {
        return response?.data ?? response;
      },
    }),
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: buildEndpointUrl('deleteEmployee', { id }),
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployeeOrderStatus: builder.mutation<void, { id: string; status: string; employee_id: string }>({
      query: ({ id, ...body }) => ({
        url: buildEndpointUrl('updateEmployeeOrderStatus', { id }),
        method: 'PUT',
        body,
      }),
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
  useGetAvailableOrdersQuery,
  useClaimEmployeeOrderMutation,
  useCreateEmployeeMutation,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeOrderStatusMutation,
} = employeeApi;

export type { Employee, ServiceOrder, LoginEmployeeResponse } from '../types/api.types';
