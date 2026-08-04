// src/types/api.types.ts
// Shared API types to avoid duplication and improve type safety

// ==================== Common Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== Error Types ====================

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'GARAGE_CONTEXT_REQUIRED';

export interface ApiErrorResponse {
  error_code?: ApiErrorCode;
  message?: string;
  error?: string;
}

// ==================== Pagination Types ====================

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  meta?: PaginationMeta;
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
  estimated_time: number; // giây
  warranty_period?: number | null; // Thời gian bảo hành (giây) - có thể null nếu không có bảo hành
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface ServiceOrder {
  id: number | string;
  customer_id: number;
  employee_id?: number | string | null;
  garage_id?: string | number | null;
  garage_code?: string | null;
  garage_name?: string | null;
  service_id: number;
  license_plate: string;
  vehicle_type?: string | null;
  vehicle_model?: string | null;
  vehicle_image_url?: string | null;
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
  customer_avatar_url?: string | null;
  customer_license_plate?: string;
  service_name?: string;
  service_description?: string;
  estimated_time?: number;
  service_image_url?: string | null;
  employee_name?: string | null;
  images?: ServiceOrderImage[];
  warranty?: Warranty;
  image_count?: number;
  claimable?: boolean;
  // Garage association
  garage?: {
    id?: string | number;
    code?: string;
    name?: string;
    address?: string | null;
  } | null;
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

export type VehicleDocumentStatus = 'valid' | 'expiring' | 'expired';

export interface VehicleDocumentFields {
  license_number?: string | null;
  license_expiry_date?: string | null;
  inspection_certificate_number?: string | null;
  inspection_date?: string | null;
  inspection_expiry_date?: string | null;
  inspection_image_url?: string | null;
  inspection_status?: VehicleDocumentStatus | null;
  insurance_company?: string | null;
  insurance_start_date?: string | null;
  insurance_register_time?: string | null;
  insurance_expiry_date?: string | null;
  insurance_expiry_time?: string | null;
  insurance_image_url?: string | null;
  insurance_status?: VehicleDocumentStatus | null;
}

export interface Vehicle extends VehicleDocumentFields {
  id: number;
  customer_id: number;
  license_plate: string;
  model?: string | null;
  production_year?: number | null;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
  // Computed fields
  has_active_order?: boolean;
  active_order_count?: number;
  last_service_date?: string;
  // Garage association
  garage?: {
    id?: string | number;
    code?: string;
    name?: string;
  } | null;
}

// ==================== Warranty Types ====================

export interface Warranty {
  id?: number;
  order_id?: number;
  customer_id?: number;
  service_id?: number | null; // ID dịch vụ (có thể null)
  employee_id?: number | null; // ID nhân viên (có thể null)
  warranty_period?: number; // tháng
  start_date?: string;
  end_date?: string;
  warranty_start?: string; // Alias for backward compatibility
  warranty_end?: string;   // Alias for backward compatibility
  note?: string | null;
  warranty_note?: string; // Alias for backward compatibility
  created_at?: string;
  updated_at?: string;
  // Populated fields from API
  service_name?: string;
  employee_name?: string;
  license_plate?: string;
  vehicle_type?: string;
}

// ==================== Product & Category Types ====================

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  product_count?: number; // Số lượng sản phẩm trong danh mục (tự động cập nhật bởi backend)
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
  video_url?: string | null; // URL video sản phẩm (có thể null)
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

export interface OfferImage {
  id: number;
  offer_id: number;
  image_url: string;
  is_primary: 0 | 1;
  created_at?: string;
}

export interface Offer {
  id: number;
  name: string;
  image_url?: string;
  service_id: number;
  service_name?: string;
  description?: string;
  content?: string; // Nội dung chi tiết ưu đãi
  discount?: number;
  valid_from?: string;
  valid_to?: string;
  primary_image?: OfferImage | null; // Ảnh chính
  images?: OfferImage[]; // Danh sách tất cả ảnh
  garage_id?: number;
  garage?: {
    id?: number;
    code?: string;
    name?: string;
    avatar_url?: string | null;
    banner_url?: string | null;
    is_super_garage?: boolean;
  } | null;
  created_at: string;
  updated_at?: string;
}

// ==================== Notification Types ====================

export interface Notification {
  id: number;
  recipient_id: number;
  recipient_type: 'customer' | 'employee';
  message?: string;
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
  warranty_period?: number; // Optional - backend will auto-fetch from service if not provided
  note?: string;
}

// ==================== Response Types ====================

export interface LoginCustomerResponse {
  success: boolean;
  customer_id: number;
  customer: Customer;
  auth_mode?: 'identity_lookup';
  error?: string;
}

export interface LoginEmployeeResponse {
  success: boolean;
  employee_id: string;
  employee: Employee;
  token?: string;
  expires_at?: string;
  garage_id?: string | number;
  garage?: {
    id?: string | number;
    code?: string;
    name?: string;
    is_super_garage?: boolean;
    address?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;
    status?: string | null;
  };
  error?: string;
}

export interface GetOrdersResponse extends PaginatedResponse<ServiceOrder> {
  customer?: Customer;
}

// ==================== Utility Types ====================

export type UserType = 'customer' | 'employee' | 'dealer' | 'garage_manager' | 'garage_admin';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'received'
  | 'in_progress' 
  | 'ready_for_pickup'
  | 'completed' 
  | 'cancelled'
  | 'canceled';

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// ==================== Product Review Types ====================

export interface ProductReview {
  id: number;
  product_id: number;
  customer_id: number;
  customer_name: string;
  customer_avatar?: string;
  order_id?: number;
  rating: number; // 1-5
  title?: string;
  content: string;
  images: string[]; // Array of image URLs (max 5)
  is_approved: boolean;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: string; // Format: "4.50"
  rating_distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
  verified_purchase_count: number;
  with_images_count: number;
}

export interface CreateReviewRequest {
  product_id: number;
  customer_id: number;
  order_id?: number;
  rating: number;
  title?: string;
  content: string;
  images?: string[]; // Optional, max 5
}

export interface ReviewListResponse extends PaginatedResponse<ProductReview> {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  average_rating?: string;
  rating_distribution?: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

