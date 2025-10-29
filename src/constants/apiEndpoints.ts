// src/constants/apiEndpoints.ts
import { API_BASE_URL } from './config';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  description: string;
  params?: string[];
  body?: string[]; // Required body fields only
}

export const ENDPOINTS: Record<string, ApiEndpoint> = {
  // Health
  health: {
    method: 'GET',
    path: '/health',
    description: 'Health check (no body)',
  },
  // Customer
  registerCustomer: {
    method: 'POST',
    path: '/customers/register',
    description: 'Register new customer (required body: name, phone)',
    body: ['name', 'phone'],
  },
  loginCustomer: {
    method: 'POST',
    path: '/customers/login',
    description: 'Customer login by phone (required body: phone)',
    body: ['phone'],
  },
  updateProfile: {
    method: 'PUT',
    path: '/customers/profile',
    description: 'Update customer profile (required param: phone; optional body: name, email, avatar_url)',
    params: ['phone'],
    body: ['name', 'email', 'avatar_url'],
  },
  deleteAccount: {
    method: 'DELETE',
    path: '/customers/account',
    description: 'Delete customer account (required param: phone; required body: confirm)',
    params: ['phone'],
    body: ['confirm'],
  },
  getServices: {
    method: 'GET',
    path: '/customers/services',
    description: 'Get all available services (no body)',
  },
  getCustomerOrders: {
    method: 'GET',
    path: '/customers/orders',
    description: 'Get customer orders by phone (required param: phone; no body)',
    params: ['phone'],
  },
  getOrderDetails: {
    method: 'GET',
    path: '/customers/orders/:id',
    description: 'Get customer order details (required param: id; no body)',
  },
  createOrder: {
    method: 'POST',
    path: '/customers/orders',
    description: 'Create customer order (required body: receiver_name, receiver_phone, license_plate, vehicle_type, service_id, receive_date)',
    body: ['receiver_name', 'receiver_phone', 'license_plate', 'vehicle_type', 'service_id', 'receive_date'],
  },
  // Service Order
  createServiceOrder: {
    method: 'POST',
    path: '/service-orders',
    description: 'Create service order (required body: customer_id, service_id, license_plate, receive_date)',
    body: ['customer_id', 'service_id', 'license_plate', 'receive_date'],
  },
  getAllServiceOrders: {
    method: 'GET',
    path: '/service-orders',
    description: 'Get all service orders (optional params: status, customer_phone, employee_id; no body)',
    params: ['status', 'customer_phone', 'employee_id'],
  },
  getServiceOrderById: {
    method: 'GET',
    path: '/service-orders/:id',
    description: 'Get service order details by ID (required param: id; no body)',
  },
  updateServiceOrderStatus: {
    method: 'PUT',
    path: '/service-orders/:id/status',
    description: 'Update service order status (required param: id; required body: status)',
    body: ['status'],
  },
  completeServiceOrder: {
    method: 'PATCH',
    path: '/service-orders/:id/complete',
    description: 'Complete service order and create warranty (required param: id; required body: delivery_date, warranty_period)',
    body: ['delivery_date', 'warranty_period'],
  },
  // Employee
  loginEmployee: {
    method: 'POST',
    path: '/employees/login',
    description: 'Employee login (required body: phone, password)',
    body: ['phone', 'password'],
  },
  getEmployeeOrders: {
    method: 'GET',
    path: '/employees/orders',
    description: 'Get employee orders (optional param: status; no body)',
    params: ['status'],
  },
  getEmployeeOrderDetails: {
    method: 'GET',
    path: '/employees/orders/:id',
    description: 'Get employee order details (required param: id; no body)',
  },
  getAssignedOrders: {
    method: 'GET',
    path: '/employees/orders/assigned',
    description: 'Get assigned orders by employee (required param: employee_id; optional param: status; no body)',
    params: ['employee_id', 'status'],
  },
  createEmployee: {
    method: 'POST',
    path: '/employees',
    description: 'Create employee (required body: name, phone, password)',
    body: ['name', 'phone', 'password'],
  },
  getEmployees: {
    method: 'GET',
    path: '/employees',
    description: 'Get all employees (no body)',
  },
  updateEmployee: {
    method: 'PATCH',
    path: '/employees/:id',
    description: 'Update employee (required param: id; optional body: name, phone, password)',
    body: ['name', 'phone', 'password'], // Optional, send partial
  },
  deleteEmployee: {
    method: 'DELETE',
    path: '/employees/:id',
    description: 'Delete employee (required param: id; no body)',
  },
  // Service
  getServicesAdmin: {
    method: 'GET',
    path: '/services',
    description: 'Get all services (no body)',
  },
  createService: {
    method: 'POST',
    path: '/services',
    description: 'Create service (required body: name)',
    body: ['name'],
  },
  updateService: {
    method: 'PATCH',
    path: '/services/:id',
    description: 'Update service (required param: id; optional body: name, description, estimated_time)',
    body: ['name', 'description', 'estimated_time'], // Optional, send partial
  },
  deleteService: {
    method: 'DELETE',
    path: '/services/:id',
    description: 'Delete service (required param: id; no body)',
  },
  // Product
  getProducts: {
    method: 'GET',
    path: '/products',
    description: 'Get all products with images (no body)',
  },
  createProduct: {
    method: 'POST',
    path: '/products',
    description: 'Create product (required body: name, price)',
    body: ['name', 'price'],
  },
  updateProduct: {
    method: 'PATCH',
    path: '/products/:id',
    description: 'Update product (required param: id; optional body: name, description, price, image_url)',
    body: ['name', 'description', 'price', 'image_url'], // Optional, send partial
  },
  deleteProduct: {
    method: 'DELETE',
    path: '/products/:id',
    description: 'Delete product (required param: id; no body)',
  },
  createProductImage: {
    method: 'POST',
    path: '/products/images',
    description: 'Create product image (required body: product_id, image_url)',
    body: ['product_id', 'image_url'],
  },
  deleteProductImage: {
    method: 'DELETE',
    path: '/products/images/:id',
    description: 'Delete product image (required param: id; no body)',
  },
  // Warranty
  checkWarranties: {
    method: 'GET',
    path: '/warranties/check',
    description: 'Check active warranties (optional params: customer_id, license_plate; no body)',
    params: ['customer_id', 'license_plate'],
  },
  getAllWarranties: {
    method: 'GET',
    path: '/warranties',
    description: 'Get all warranties (optional param: customer_id; no body)',
    params: ['customer_id'],
  },
  getWarrantyById: {
    method: 'GET',
    path: '/warranties/:id',
    description: 'Get warranty by ID (required param: id; no body)',
  },
  createWarranty: {
    method: 'POST',
    path: '/warranties',
    description: 'Create warranty (required body: order_id, customer_id, warranty_period, start_date)',
    body: ['order_id', 'customer_id', 'warranty_period', 'start_date'],
  },
  updateWarranty: {
    method: 'PATCH',
    path: '/warranties/:id',
    description: 'Update warranty (required param: id; optional body: warranty_period, start_date, note)',
    body: ['warranty_period', 'start_date', 'note'],
  },
  deleteWarranty: {
    method: 'DELETE',
    path: '/warranties/:id',
    description: 'Delete warranty (required param: id; no body)',
  },
  // Notification
  getNotifications: {
    method: 'GET',
    path: '/notifications',
    description: 'Get notifications (required params: recipient_id, recipient_type; optional params: is_read, limit, offset)',
    params: ['recipient_id', 'recipient_type', 'is_read', 'limit', 'offset'],
  },
  getUnreadCount: {
    method: 'GET',
    path: '/notifications/count',
    description: 'Count unread notifications (required params: recipient_id, recipient_type)',
    params: ['recipient_id', 'recipient_type'],
  },
  createNotification: {
    method: 'POST',
    path: '/notifications',
    description: 'Create notification (required body: recipient_id, recipient_type, message)',
    body: ['recipient_id', 'recipient_type', 'message'],
  },
  markNotificationRead: {
    method: 'PATCH',
    path: '/notifications/:id/read',
    description: 'Mark notification as read (required param: id; no body)',
  },
  markAllNotificationsRead: {
    method: 'PATCH',
    path: '/notifications/mark-all-read',
    description: 'Mark all notifications as read (required body: recipient_id, recipient_type)',
    body: ['recipient_id', 'recipient_type'],
  },
  deleteNotification: {
    method: 'DELETE',
    path: '/notifications/:id',
    description: 'Delete notification (required param: id; no body)',
  },
  // FCM Token Management
  registerFcmToken: {
    method: 'POST',
    path: '/fcm-tokens/register',
    description: 'Register/Update FCM token (required body: user_id, user_type, token, device_info)',
    body: ['user_id', 'user_type', 'token', 'device_info'],
  },
  getUserFcmTokens: {
    method: 'GET',
    path: '/fcm-tokens/user',
    description: 'Get all FCM tokens for a user (required params: user_id, user_type)',
    params: ['user_id', 'user_type'],
  },
  deleteFcmToken: {
    method: 'DELETE',
    path: '/fcm-tokens',
    description: 'Delete FCM token on logout (required body: token)',
    body: ['token'],
  },
  getActiveFcmTokens: {
    method: 'GET',
    path: '/fcm-tokens/active',
    description: 'Get all active FCM tokens (admin only)',
  },
  // Service Order Image
  uploadServiceOrderImage: {
    method: 'POST',
    path: '/service-order-images',
    description: 'Upload service order image (required body: order_id, image_url, status_at_time, uploaded_by)',
    body: ['order_id', 'image_url', 'status_at_time', 'uploaded_by'],
  },
  getServiceOrderImages: {
    method: 'GET',
    path: '/service-order-images/:order_id',
    description: 'Get service order images (required param: order_id; no body)',
  },
  // Offers
  getOffers: {
    method: 'GET',
    path: '/offers',
    description: 'Get all offers (no body)',
  },
  createOffer: {
    method: 'POST',
    path: '/offers',
    description: 'Create offer (required body: name, service_id)',
    body: ['name', 'service_id'],
  },
  getOfferById: {
    method: 'GET',
    path: '/offers/:id',
    description: 'Get offer by ID (required param: id; no body)',
  },
  updateOffer: {
    method: 'PATCH',
    path: '/offers/:id',
    description: 'Update offer (required param: id; optional body: name, service_id)',
    body: ['name', 'service_id'],
  },
  deleteOffer: {
    method: 'DELETE',
    path: '/offers/:id',
    description: 'Delete offer (required param: id; no body)',
  },
  // Categories
  getCategories: {
    method: 'GET',
    path: '/categories',
    description: 'Get all categories (no body)',
  },
  createCategory: {
    method: 'POST',
    path: '/categories',
    description: 'Create category (required body: name)',
    body: ['name'],
  },
  getCategoryById: {
    method: 'GET',
    path: '/categories/:id',
    description: 'Get category by ID with products (required param: id; no body)',
  },
  updateCategory: {
    method: 'PATCH',
    path: '/categories/:id',
    description: 'Update category (required param: id; optional body: name, description, image_url)',
    body: ['name', 'description', 'image_url'],
  },
  deleteCategory: {
    method: 'DELETE',
    path: '/categories/:id',
    description: 'Delete category (required param: id; no body)',
  },
  // Vehicle
  getCustomerVehicles: {
    method: 'GET',
    path: '/customers/vehicles',
    description: 'Get customer vehicles (required param: phone; no body)',
    params: ['phone'],
  },
  getVehicleById: {
    method: 'GET',
    path: '/vehicles/:id',
    description: 'Get vehicle by ID (required param: id; no body)',
  },
  createVehicle: {
    method: 'POST',
    path: '/vehicles',
    description: 'Create vehicle (required body: customer_id, license_plate)',
    body: ['customer_id', 'license_plate'],
  },
  updateVehicle: {
    method: 'PUT',
    path: '/vehicles/:id',
    description: 'Update vehicle (required param: id; optional body: model, image_url)',
    body: ['model', 'image_url'],
  },
  deleteVehicle: {
    method: 'DELETE',
    path: '/vehicles/:id',
    description: 'Delete vehicle (required param: id; no body)',
  },
  // Upload Image
  uploadSingleImage: {
    method: 'POST',
    path: '/upload/single',
    description: 'Upload single image file (multipart/form-data with field: image)',
  },
  uploadMultipleImages: {
    method: 'POST',
    path: '/upload/multiple',
    description: 'Upload multiple image files (max 10, multipart/form-data with field: images)',
  },
  deleteUploadedImage: {
    method: 'DELETE',
    path: '/upload/:filename',
    description: 'Delete uploaded image file (required param: filename; no body)',
  },
};

export const buildEndpointUrl = (endpointKey: keyof typeof ENDPOINTS, params: Record<string, string> = {}): string => {
  let url = ENDPOINTS[endpointKey].path;
  const replaced = new Set<string>();
  Object.entries(params).forEach(([key, value]) => {
    if (url.includes(`:${key}`)) {
      url = url.replace(`:${key}`, value);
      replaced.add(key);
    }
  });
  const queryParams = Object.entries(params).filter(([key]) => !replaced.has(key));
  if (queryParams.length > 0) {
    const queryString = queryParams.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
    url += `?${queryString}`;
  }
  return `${API_BASE_URL}${url}`;
};