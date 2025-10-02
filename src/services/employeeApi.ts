// src/services/employeeApi.ts (Updated: Added avatar_url to Employee interface)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

interface Employee {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  created_at?: string;
}

interface LoginEmployeeResponse {
  success: boolean;
  employee_id: string;
  employee?: Employee;
}

interface Image {
  image_url: string;
  description?: string;
  status_at_time: string;
  created_at?: string;
}

interface ServiceOrder {
  id: string;
  customer_id: number;
  employee_id?: number;
  service_id: number;
  license_plate: string;
  vehicle_type?: string | null;
  receiver_name?: string;
  receiver_phone?: string;
  address?: string;
  receive_date: string;
  delivery_date?: string;
  status: string;
  note?: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_license_plate: string;
  service_name: string;
  service_description: string;
  estimated_time: number;
  images?: Image[]; // Optional to handle undefined
  employee_name?: string;
  warranty_period?: number;
  warranty_start?: string;
  warranty_end?: string;
  warranty_note?: string | null;
}

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
    }),
    getAssignedOrders: builder.query<ServiceOrder[], { employee_id: string; status?: string }>({
      query: (params) => ({ url: ENDPOINTS.getAssignedOrders.path, params }),
      providesTags: ['ServiceOrder'],
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