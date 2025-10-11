// src/services/customerApi.ts (Updated: Removed email from registerCustomer mutation)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_BASE_URL } from '../constants/config';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  license_plate?: string;
  avatar_url?: string;
}

interface LoginCustomerResponse {
  error: string;
  success: boolean;
  customer_id: number;
  customer: Customer;
}

interface Service {
  id: number;
  name: string;
  description: string;
  estimated_time: number;
  created_at: string;
}

interface BaseServiceOrder {
  id: number;
  service_id: number;
  license_plate: string;
  vehicle_type?: string;
  status: string;
  receive_date: string;
  delivery_date?: string;
  note?: string;
  created_at: string;
  employee_name?: string | null;
  service_name?: string;
}

interface ServiceOrderImage {
  image_url: string;
  status_at_time: string;
  description?: string;
  created_at: string;
}

interface Warranty {
  warranty_period?: number;
  warranty_start?: string;
  warranty_end?: string;
  warranty_note?: string;
}

interface DetailedServiceOrder extends BaseServiceOrder {
  receiver_name?: string;
  receiver_phone?: string;
  address?: string;
  customer_name?: string;
  customer_phone?: string;
  service_description?: string;
  estimated_time?: number;
  images: ServiceOrderImage[];
  warranty?: Warranty;
}

interface GetCustomerOrdersResponse {
  length: number | undefined;
  success: boolean;
  data: BaseServiceOrder[];
  count: number;
  customer?: Customer;
}

interface CreateOrderRequest {
  receiver_name: string;
  receiver_phone: string;
  license_plate: string;
  vehicle_type: string;
  service_id: number;
  receive_date: string;
  delivery_date?: string;
  note?: string;
}

interface CreateOrderResponse {
  success: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  customer?: Customer;
  error?: string;
}

interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar_url?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  customer: Customer;
  message: string;
}

interface DeleteAccountRequest {
  confirm: boolean;
}

interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deleted_data: {
    customer: Customer;
    vehicles_deleted: number;
    orders_deleted: number;
    warranties_deleted: number;
    notifications_deleted: number;
  };
}

export const customerApi = createApi({
  reducerPath: 'customerApi' as const,
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Customer', 'Service', 'ServiceOrder'] as const,
  endpoints: (builder) => ({
    health: builder.query<{ message: string }, void>({
      query: () => ENDPOINTS.health.path,
    }),
    registerCustomer: builder.mutation<
      { success: boolean; customer_id?: number; customer?: Customer; message?: string }, 
      { name: string; phone: string; license_plate?: string; avatar_url?: string }
    >({
      query: (body) => ({ url: ENDPOINTS.registerCustomer.path, method: 'POST', body }),
      invalidatesTags: ['Customer'],
      transformResponse: (response: any) => {
        console.log('registerCustomer response:', response); // Debug
        // Backend returns: { success: true, customer_id: number, message: string }
        if (!response.success) throw new Error(response.error || response.message || 'Failed to register customer');
        return { 
          success: true, 
          customer_id: response.customer_id,
          customer: response.customer,
          message: response.message 
        };
      },
    }),
    loginCustomer: builder.mutation<LoginCustomerResponse, { phone: string }>({
      query: (body) => ({ url: ENDPOINTS.loginCustomer.path, method: 'POST', body }),
      transformResponse: (response: LoginCustomerResponse) => {
        console.log('loginCustomer response:', response); // Debug
        if (!response.success) throw new Error(response.error || 'Failed to login customer');
        return response; // Return direct response since backend returns flat object
      },
    }),
    getServices: builder.query<{ success: boolean; data: Service[]; count: number }, void>({
      query: () => ENDPOINTS.getServices.path,
      providesTags: ['Service'],
      transformResponse: (response: ApiResponse<Service[]>) => {
        console.log('getServices response:', response); // Debug
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch services');
        return { success: true, data: response.data, count: response.count || response.data.length };
      },
    }),
    getCustomerOrders: builder.query<GetCustomerOrdersResponse, string>({
      query: (phone) => ({ url: `${ENDPOINTS.getCustomerOrders.path}?phone=${phone}` }),
      providesTags: ['ServiceOrder'],
      transformResponse: (response: ApiResponse<GetCustomerOrdersResponse>) => {
        console.log('getCustomerOrders response:', response); // Debug
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch customer orders');
        return { success: true, data: response.data, count: response.count || response.data.length, customer: response.customer };
      },
    }),
    getOrderDetails: builder.query<DetailedServiceOrder, string>({
      query: (id) => buildEndpointUrl('getOrderDetails', { id }),
      providesTags: (result, error, id) => [{ type: 'ServiceOrder' as const, id }],
      transformResponse: (response: ApiResponse<DetailedServiceOrder>) => {
        console.log('getOrderDetails response:', response); // Debug
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch order details');
        return {
          ...response.data,
          images: response.data.images || [],
          warranty: response.data.warranty ? { ...response.data.warranty } : undefined,
        };
      },
    }),
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({ url: ENDPOINTS.createOrder.path, method: 'POST', body }),
      invalidatesTags: ['ServiceOrder'],
      transformResponse: (response: ApiResponse<CreateOrderResponse>) => {
        console.log('createOrder response:', response); // Debug
        if (!response.success) throw new Error(response.error || 'Failed to create order');
        return { success: true };
      },
    }),
    updateProfile: builder.mutation<UpdateProfileResponse, { phone: string } & UpdateProfileRequest>({
      query: ({ phone, ...body }) => ({ 
        url: `${ENDPOINTS.updateProfile.path}?phone=${phone}`, 
        method: 'PUT', 
        body 
      }),
      invalidatesTags: ['Customer'],
      transformResponse: (response: UpdateProfileResponse) => {
        console.log('updateProfile response:', response);
        if (!response.success) throw new Error('Failed to update profile');
        return response;
      },
    }),
    deleteAccount: builder.mutation<DeleteAccountResponse, { phone: string } & DeleteAccountRequest>({
      query: ({ phone, confirm }) => ({ 
        url: `${ENDPOINTS.deleteAccount.path}?phone=${phone}`, 
        method: 'DELETE', 
        body: { confirm } 
      }),
      invalidatesTags: ['Customer', 'ServiceOrder'],
      transformResponse: (response: DeleteAccountResponse) => {
        console.log('deleteAccount response:', response);
        if (!response.success) throw new Error(response.message || 'Failed to delete account');
        return response;
      },
    }),
  }),
});

export const {
  useHealthQuery,
  useRegisterCustomerMutation,
  useLoginCustomerMutation,
  useGetServicesQuery,
  useGetCustomerOrdersQuery,
  useGetOrderDetailsQuery,
  useCreateOrderMutation,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} = customerApi;