// src/services/customerApi.ts (Updated: Removed email from registerCustomer mutation)
import { createApi } from '@reduxjs/toolkit/query/react';
import { ENDPOINTS, buildEndpointUrl } from '../constants/apiEndpoints';
import { API_CONFIG, baseQueryWithRetry } from './baseApi';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  license_plate?: string;
  avatar_url?: string;
}

// Customer driver license
export interface DriverLicense {
  id: number;
  customer_id: number;
  // Backend fields
  license_no?: string | null;
  registered_at?: string | null;
  expires_at?: string | null;
  // Normalized fields for app usage
  license_number?: string | null;
  issued_date?: string | null;
  expiry_date?: string | null;
  license_class?: string | null;
  issued_by?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
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
  estimated_time: number; // giây
  image_url?: string | null; // URL ảnh dịch vụ
  warranty_period?: number | null; // Thời gian bảo hành (giây) - có thể null nếu không có bảo hành
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

// Admin UI visibility
export interface UiVisibility {
  id: number;
  is_hidden: number; // 0: show, 1: hide
  created_at: string;
  updated_at: string;
}

export const customerApi = createApi({
  ...API_CONFIG,
  reducerPath: 'customerApi' as const,
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Customer', 'Service', 'ServiceOrder'] as const,
  endpoints: (builder) => ({
    health: builder.query<{ message: string }, void>({
      query: () => ENDPOINTS.health.path,
    }),
    registerCustomer: builder.mutation<
      { success: boolean; customer_id?: number; customer?: Customer; message?: string },
      { name: string; phone?: string; license_plate?: string; avatar_url?: string }
    >({
      query: (body) => ({ url: ENDPOINTS.registerCustomer.path, method: 'POST', body }),
      invalidatesTags: ['Customer'],
      transformResponse: (response: any) => {
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
        if (!response.success) throw new Error(response.error || 'Failed to login customer');
        return response; // Return direct response since backend returns flat object
      },
    }),
    getServices: builder.query<{ success: boolean; data: Service[]; count: number }, void>({
      query: () => ENDPOINTS.getServices.path,
      providesTags: ['Service'],
      transformResponse: (response: ApiResponse<Service[]>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch services');
        return { success: true, data: response.data, count: response.count || response.data.length };
      },
    }),
    getCustomerOrders: builder.query<GetCustomerOrdersResponse, string>({
      query: (phone) => ({ url: `${ENDPOINTS.getCustomerOrders.path}?phone=${phone}` }),
      providesTags: ['ServiceOrder'],
      transformResponse: (response: ApiResponse<GetCustomerOrdersResponse>) => {
        if (!response.success || !response.data) throw new Error(response.error || 'Failed to fetch customer orders');
        return { success: true, data: response.data, count: response.count || response.data.length, customer: response.customer };
      },
    }),
    getOrderDetails: builder.query<DetailedServiceOrder, string>({
      query: (id) => buildEndpointUrl('getOrderDetails', { id }),
      providesTags: (result, error, id) => [{ type: 'ServiceOrder' as const, id }],
      transformResponse: (response: ApiResponse<DetailedServiceOrder>) => {
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
        if (!response.success) throw new Error(response.message || 'Failed to delete account');
        return response;
      },
    }),
    getUiVisibility: builder.query<UiVisibility | null, void>({
      query: () => ENDPOINTS.getUiVisibility.path,
      transformResponse: (response: any): UiVisibility | null => {
        if (!response || typeof response !== 'object') return null;
        if (response.success === false) return null;
        return response.data ?? null;
      },
    }),
    getCustomerDriverLicense: builder.query<DriverLicense | null, string>({
      query: (customerId) => ({
        url: ENDPOINTS.getCustomerDriverLicense.path.replace(':id', customerId),
        method: ENDPOINTS.getCustomerDriverLicense.method,
      }),
      providesTags: ['Customer'],
      /**
       * Chuẩn hóa đúng theo spec backend bạn gửi:
       * 200: { success: true, data: { id, customer_id, license_no, registered_at, expires_at, ... } }
       * 404: { success: false, error: "Không tìm thấy giấy phép lái xe" }
       */
      transformResponse: (response: any): DriverLicense | null => {
        if (!response || typeof response !== 'object') return null;

        // Không có GPLX -> form trống
        if (response.success === false) {
          return null;
        }

        const raw = response.data;
        if (!raw) return null;

        const normalized: DriverLicense = {
          id: raw.id,
          customer_id: raw.customer_id,
          // Backend fields
          license_no: raw.license_no ?? null,
          registered_at: raw.registered_at ?? null,
          expires_at: raw.expires_at ?? null,
          // Normalized cho UI
          license_number: raw.license_no ?? null,
          issued_date: raw.registered_at ?? null,
          expiry_date: raw.expires_at ?? null,
          license_class: raw.license_class ?? null,
          issued_by: raw.issued_by ?? null,
          image_url: raw.image_url ?? null,
          created_at: raw.created_at,
          updated_at: raw.updated_at,
        };

        return normalized;
      },
    }),
    upsertCustomerDriverLicense: builder.mutation<
      { success: boolean; message?: string; driver_license_id?: number },
      { customerId: string; license_no: string; registered_at?: string | null; expires_at?: string | null }
    >({
      query: ({ customerId, ...body }) => ({
        url: ENDPOINTS.upsertCustomerDriverLicense.path.replace(':id', customerId),
        method: ENDPOINTS.upsertCustomerDriverLicense.method,
        body,
      }),
      invalidatesTags: ['Customer'],
      // Backend spec:
      // - Update: { success: true, message: "...", driver_license_id: 1 }
      // - Create: { success: true, message: "...", driver_license_id: 2 }
      transformResponse: (response: any) => {
        if (!response.success) {
          throw new Error(response.error || response.message || 'Failed to update driver license');
        }
        return {
          success: true,
          message: response.message,
          driver_license_id: response.driver_license_id,
        };
      },
    }),
    deleteCustomerDriverLicense: builder.mutation<
      { success: boolean; message?: string },
      { customerId: string }
    >({
      query: ({ customerId }) => ({
        url: ENDPOINTS.deleteCustomerDriverLicense.path.replace(':id', customerId),
        method: ENDPOINTS.deleteCustomerDriverLicense.method,
      }),
      invalidatesTags: ['Customer'],
      transformResponse: (response: any) => {
        if (!response.success) {
          throw new Error(response.error || response.message || 'Failed to delete driver license');
        }
        return {
          success: true,
          message: response.message,
        };
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
  useGetCustomerDriverLicenseQuery,
  useUpsertCustomerDriverLicenseMutation,
  useDeleteCustomerDriverLicenseMutation,
  useGetUiVisibilityQuery,
} = customerApi;