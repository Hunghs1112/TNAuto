// src/types/api.types.ts
// Shared API types to avoid duplication and improve type safety

// ==================== Common Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page?: number;
  limit?: number;
}

// ==================== User Types ====================

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  license_plate?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== Service Types ====================

export interface Service {
  id: number;
  name: string;
  description: string;
  estimated_time: number;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface ServiceOrder {
  id: number | string;
  customer_id: number;
  employee_id?: number | null;
  service_id: number;
  license_plate: string;
  vehicle_type?: string | null;
  receiver_name?: string;
  receiver_phone?: string;
  address?: string | null;
  receive_date: string;
  delivery_date?: string | null;
  status: string;
  note?: string | null;
  created_at: string;
  updated_at?: string;
  // Populated fields
  customer_name?: string;
  customer_phone?: string;
  customer_license_plate?: string;
  service_name?: string;
  service_description?: string;
  estimated_time?: number;
  employee_name?: string | null;
  images?: ServiceOrderImage[];
  warranty?: Warranty;
  image_count?: number;
}

export interface ServiceOrderImage {
  id?: number;
  order_id?: number;
  image_url: string;
  status_at_time: string;
  description?: string | null;
  uploaded_by?: string;
  created_at: string;
}

// ==================== Vehicle Types ====================

export interface Vehicle {
  id: number;
  customer_id: number;
  license_plate: string;
  model?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
  // Computed fields
  has_active_order?: boolean;
  active_order_count?: number;
  last_service_date?: string;
}

// ==================== Warranty Types ====================

export interface Warranty {
  id?: number;
  order_id?: number;
  customer_id?: number;
  warranty_period?: number;
  start_date?: string;
  end_date?: string;
  warranty_start?: string; // Alias for backward compatibility
  warranty_end?: string;   // Alias for backward compatibility
  note?: string | null;
  warranty_note?: string; // Alias for backward compatibility
  created_at?: string;
  updated_at?: string;
}

// ==================== Product & Category Types ====================

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  primary_image?: string; // URL of primary image (from images array)
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id?: number;
  product_id?: number;
  image_url: string;
  is_primary: boolean;
  created_at?: string;
}

// ==================== Offer Types ====================

export interface Offer {
  id: number;
  name: string;
  image_url?: string;
  service_id: number;
  service_name?: string;
  description?: string;
  discount?: number;
  valid_from?: string;
  valid_to?: string;
  created_at: string;
  updated_at?: string;
}

// ==================== Notification Types ====================

export interface Notification {
  id: number;
  recipient_id: number;
  recipient_type: 'customer' | 'employee';
  message: string;
  type?: string;
  read: boolean;
  created_at: string;
  updated_at?: string;
}

// ==================== Request Types ====================

export interface LoginRequest {
  phone: string;
  password?: string;
}

export interface RegisterCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  license_plate?: string;
}

export interface CreateOrderRequest {
  customer_id?: number;
  service_id: number;
  license_plate: string;
  vehicle_type?: string;
  receiver_name: string;
  receiver_phone: string;
  address?: string;
  receive_date: string;
  note?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
  employee_id?: number;
  note?: string;
}

export interface CompleteOrderRequest {
  delivery_date: string;
  warranty_period: number;
  note?: string;
}

// ==================== Response Types ====================

export interface LoginCustomerResponse {
  success: boolean;
  customer_id: number;
  customer: Customer;
  error?: string;
}

export interface LoginEmployeeResponse {
  success: boolean;
  employee_id: string;
  employee: Employee;
  error?: string;
}

export interface GetOrdersResponse extends PaginatedResponse<ServiceOrder> {
  customer?: Customer;
}

// ==================== Utility Types ====================

export type UserType = 'customer' | 'employee';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

