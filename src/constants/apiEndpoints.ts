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
  // Admin UI visibility
  getUiVisibility: {
    method: 'GET',
    path: '/admin/ui-visibility',
    description: 'Get global UI visibility flags (e.g. hide/show sections)',
  },
  // Customer
  registerCustomer: {
    method: 'POST',
    path: '/api/app/customer/auth/register',
    description: 'Register customer for app namespace (required body: name, phone)',
    body: ['name', 'phone'],
  },
  loginCustomer: {
    method: 'POST',
    path: '/api/app/customer/auth/login',
    description: 'Customer login in app namespace (required body: phone)',
    body: ['phone'],
  },
  checkPhone: {
    method: 'POST',
    path: '/api/app/customer/auth/check-phone',
    description: 'Check phone and return matched roles',
    body: ['phone'],
  },
  getPublicGarages: {
    method: 'GET',
    path: '/api/public/garages',
    description: 'Get public list of active garages for discovery/deep-link (includes is_super_garage)',
    params: ['search', 'city', 'limit'],
  },
  resolveGarageByCode: {
    method: 'GET',
    path: '/api/public/garages/by-code/:code',
    description: 'Resolve one garage by code for tenant selection (includes is_super_garage; required param: code; no body)',
    params: ['code'],
  },
  addCustomerGarage: {
    method: 'POST',
    path: '/api/app/customer/garages',
    description: 'Idempotent link customer to garage (required body: customer_id, garage_code; optional body: source)',
    body: ['customer_id', 'garage_code'],
  },
  // Customer profile & documents
  updateProfile: {
    method: 'PUT',
    path: '/api/app/customer/profile',
    description: 'Update customer profile via customer aggregate route',
    body: ['name', 'email', 'avatar_url'],
  },
  deleteAccount: {
    method: 'DELETE',
    path: '/api/app/customer/account',
    description: 'Delete customer account (required body: confirm)',
    body: ['confirm'],
  },
  getCustomerDriverLicense: {
    method: 'GET',
    path: '/api/app/customer/driver-license',
    description: 'Get customer driver license in aggregate route',
  },
  upsertCustomerDriverLicense: {
    method: 'PUT',
    path: '/api/app/customer/driver-license',
    description: 'Create or update customer driver license',
    body: ['license_number', 'license_class', 'issued_date', 'expiry_date', 'issued_by', 'image_url'],
  },
  deleteCustomerDriverLicense: {
    method: 'DELETE',
    path: '/api/app/customer/driver-license',
    description: 'Delete customer driver license',
  },
  getServices: {
    method: 'GET',
    path: '/api/app/garages/:garageCode/services',
    description: 'Get services for selected garage (path-based tenant)',
    params: ['garageCode'],
  },
  getCustomerOrders: {
    method: 'GET',
    path: '/api/app/customer/orders',
    description: 'Get customer aggregate orders (requires customer context)',
    params: ['customer_id'],
  },
  getCustomerWarranties: {
    method: 'GET',
    path: '/api/app/customer/warranties',
    description: 'Get customer aggregate warranties (requires customer context)',
    params: ['customer_id', 'status', 'page', 'limit'],
  },
  getCustomerOverview: {
    method: 'GET',
    path: '/api/app/customer/overview',
    description: 'Get customer aggregated dashboard overview',
    params: ['customer_id'],
  },
  getOrderDetails: {
    method: 'GET',
    path: '/api/app/customer/orders/:id',
    description: 'Get customer order details by ID',
  },
  getCustomerOrderImages: {
    method: 'GET',
    path: '/api/app/customer/orders/:id/images',
    description: 'Get images of a customer order by ID',
    params: ['id'],
  },
  createOrder: {
    method: 'POST',
    path: '/api/app/garages/:garageCode/orders',
    description: 'Create order in selected garage with customer context',
    params: ['garageCode'],
    body: ['customer_id', 'receiver_name', 'receiver_phone', 'license_plate', 'vehicle_type', 'service_id', 'receive_date', 'delivery_date'],
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
    path: '/service-orders/admin/:id/complete',
    description: 'Complete service order and create warranty (required param: id; required body: delivery_date; optional body: warranty_period - backend will auto-fetch from service if not provided)',
    body: ['delivery_date', 'warranty_period'],
  },
  // Employee
  loginEmployee: {
    method: 'POST',
    path: '/api/app/employee/auth/login',
    description: 'Employee login in app namespace (token-based)',
    body: ['phone', 'password'],
  },
  employeeChangePassword: {
    method: 'PUT',
    path: '/api/app/employee/change-password',
    description: 'Employee self-service change password (requires Bearer token)',
    body: ['current_password', 'new_password'],
  },
  managerLogin: {
    method: 'POST',
    path: '/api/app/manager/auth/login',
    description: 'Garage manager/admin login in app namespace',
    body: ['login', 'password'],
  },
  getManagerHomeSummary: {
    method: 'GET',
    path: '/api/app/manager/home/summary',
    description: 'Get manager home summary (KPI overview)',
  },
  getManagerHomeOrders: {
    method: 'GET',
    path: '/api/app/manager/home/orders',
    description: 'Get manager home orders for dashboard',
  },
  getManagerHomeNotifications: {
    method: 'GET',
    path: '/api/app/manager/home/notifications',
    description: 'Get manager home notifications for dashboard',
  },
  // App Admin - Customers
  adminCustomersStats: {
    method: 'GET',
    path: '/api/app/admin/customers/stats',
    description: 'Get admin customer statistics',
  },
  adminCustomers: {
    method: 'GET',
    path: '/api/app/admin/customers',
    description: 'Get admin customer list',
  },
  adminCreateCustomer: {
    method: 'POST',
    path: '/api/app/admin/customers',
    description: 'Create admin customer',
  },
  adminCustomerById: {
    method: 'GET',
    path: '/api/app/admin/customers/:id',
    description: 'Get admin customer detail',
    params: ['id'],
  },
  adminUpdateCustomer: {
    method: 'PUT',
    path: '/api/app/admin/customers/:id',
    description: 'Replace admin customer',
    params: ['id'],
  },
  adminPatchCustomer: {
    method: 'PATCH',
    path: '/api/app/admin/customers/:id',
    description: 'Update admin customer fields',
    params: ['id'],
  },
  adminDeleteCustomer: {
    method: 'DELETE',
    path: '/api/app/admin/customers/:id',
    description: 'Delete admin customer',
    params: ['id'],
  },
  adminCustomerVehicles: {
    method: 'GET',
    path: '/api/app/admin/customers/:id/vehicles',
    description: 'Get customer vehicles in admin scope',
    params: ['id'],
  },
  adminCreateCustomerVehicle: {
    method: 'POST',
    path: '/api/app/admin/customers/:id/vehicles',
    description: 'Create customer vehicle in admin scope',
    params: ['id'],
  },
  adminUploadCustomerAvatar: {
    method: 'POST',
    path: '/api/app/admin/customers/:id/upload-avatar',
    description: 'Upload customer avatar in admin scope',
    params: ['id'],
  },
  adminCustomerDriverLicense: {
    method: 'GET',
    path: '/api/app/admin/customers/:id/driver-license',
    description: 'Get customer driver license in admin scope',
    params: ['id'],
  },
  adminUpsertCustomerDriverLicense: {
    method: 'PUT',
    path: '/api/app/admin/customers/:id/driver-license',
    description: 'Create or update customer driver license in admin scope',
    params: ['id'],
  },
  adminDeleteCustomerDriverLicense: {
    method: 'DELETE',
    path: '/api/app/admin/customers/:id/driver-license',
    description: 'Delete customer driver license in admin scope',
    params: ['id'],
  },
  // App Admin - Employees
  adminEmployeesStats: {
    method: 'GET',
    path: '/api/app/admin/employees/stats',
    description: 'Get admin employee statistics',
  },
  adminEmployees: {
    method: 'GET',
    path: '/api/app/admin/employees',
    description: 'Get admin employee list',
  },
  adminCreateEmployee: {
    method: 'POST',
    path: '/api/app/admin/employees',
    description: 'Create admin employee',
  },
  adminEmployeeById: {
    method: 'GET',
    path: '/api/app/admin/employees/:id',
    description: 'Get admin employee detail',
    params: ['id'],
  },
  adminUpdateEmployee: {
    method: 'PUT',
    path: '/api/app/admin/employees/:id',
    description: 'Update admin employee',
    params: ['id'],
  },
  adminDeleteEmployee: {
    method: 'DELETE',
    path: '/api/app/admin/employees/:id',
    description: 'Delete admin employee',
    params: ['id'],
  },
  adminAssignOrderToEmployee: {
    method: 'POST',
    path: '/api/app/admin/employees/assign-order',
    description: 'Assign service order to employee in admin scope',
  },
  adminUploadEmployeeAvatar: {
    method: 'POST',
    path: '/api/app/admin/employees/:id/upload-avatar',
    description: 'Upload admin employee avatar',
    params: ['id'],
  },
  // App Admin - Dealers
  adminDealers: {
    method: 'GET',
    path: '/api/app/admin/dealers',
    description: 'Get admin dealer list',
  },
  adminDealerById: {
    method: 'GET',
    path: '/api/app/admin/dealers/:id',
    description: 'Get admin dealer detail',
    params: ['id'],
  },
  adminUpdateDealer: {
    method: 'PUT',
    path: '/api/app/admin/dealers/:id',
    description: 'Update admin dealer',
    params: ['id'],
  },
  adminDeleteDealer: {
    method: 'DELETE',
    path: '/api/app/admin/dealers/:id',
    description: 'Delete admin dealer',
    params: ['id'],
  },
  // App Admin - Dealer Categories
  adminDealerCategories: {
    method: 'GET',
    path: '/api/app/admin/dealer-categories',
    description: 'Get admin dealer category list',
  },
  adminCreateDealerCategory: {
    method: 'POST',
    path: '/api/app/admin/dealer-categories',
    description: 'Create admin dealer category',
  },
  adminDealerCategoryById: {
    method: 'GET',
    path: '/api/app/admin/dealer-categories/:id',
    description: 'Get admin dealer category detail',
    params: ['id'],
  },
  adminUpdateDealerCategory: {
    method: 'PUT',
    path: '/api/app/admin/dealer-categories/:id',
    description: 'Update admin dealer category',
    params: ['id'],
  },
  adminDeleteDealerCategory: {
    method: 'DELETE',
    path: '/api/app/admin/dealer-categories/:id',
    description: 'Delete admin dealer category',
    params: ['id'],
  },
  // App Admin - Dealer Products
  adminDealerProducts: {
    method: 'GET',
    path: '/api/app/admin/dealer-products',
    description: 'Get admin dealer product list',
  },
  adminCreateDealerProduct: {
    method: 'POST',
    path: '/api/app/admin/dealer-products',
    description: 'Create admin dealer product',
  },
  adminDealerProductById: {
    method: 'GET',
    path: '/api/app/admin/dealer-products/:id',
    description: 'Get admin dealer product detail',
    params: ['id'],
  },
  adminUpdateDealerProduct: {
    method: 'PUT',
    path: '/api/app/admin/dealer-products/:id',
    description: 'Update admin dealer product',
    params: ['id'],
  },
  adminDeleteDealerProduct: {
    method: 'DELETE',
    path: '/api/app/admin/dealer-products/:id',
    description: 'Delete admin dealer product',
    params: ['id'],
  },
  adminDealerProductImages: {
    method: 'GET',
    path: '/api/app/admin/dealer-products/:productId/images',
    description: 'Get admin dealer product images',
    params: ['productId'],
  },
  adminCreateDealerProductImage: {
    method: 'POST',
    path: '/api/app/admin/dealer-products/images',
    description: 'Create admin dealer product image',
  },
  adminUpdateDealerProductImage: {
    method: 'PUT',
    path: '/api/app/admin/dealer-products/images/:id',
    description: 'Update admin dealer product image',
    params: ['id'],
  },
  adminDeleteDealerProductImage: {
    method: 'DELETE',
    path: '/api/app/admin/dealer-products/images/:id',
    description: 'Delete admin dealer product image',
    params: ['id'],
  },
  // App Admin - Service Orders
  adminServiceOrdersStats: {
    method: 'GET',
    path: '/api/app/admin/service-orders/stats',
    description: 'Get admin service order statistics',
  },
  adminServiceOrders: {
    method: 'GET',
    path: '/api/app/admin/service-orders',
    description: 'Get admin service order list',
  },
  adminCreateServiceOrder: {
    method: 'POST',
    path: '/api/app/admin/service-orders',
    description: 'Create admin service order',
  },
  adminServiceOrderById: {
    method: 'GET',
    path: '/api/app/admin/service-orders/:id',
    description: 'Get admin service order detail',
    params: ['id'],
  },
  adminDeleteServiceOrder: {
    method: 'DELETE',
    path: '/api/app/admin/service-orders/:id',
    description: 'Delete admin service order',
    params: ['id'],
  },
  adminUpdateServiceOrderStatus: {
    method: 'PUT',
    path: '/api/app/admin/service-orders/:id/status',
    description: 'Update admin service order status',
    params: ['id'],
  },
  adminCompleteServiceOrder: {
    method: 'PATCH',
    path: '/api/app/admin/service-orders/:id/complete',
    description: 'Complete admin service order',
    params: ['id'],
  },
  adminAssignServiceOrder: {
    method: 'PATCH',
    path: '/api/app/admin/service-orders/:id/assign',
    description: 'Assign admin service order',
    params: ['id'],
  },
  adminServiceOrderImages: {
    method: 'GET',
    path: '/api/app/admin/service-orders/:id/images',
    description: 'Get admin service order images',
    params: ['id'],
  },
  adminCreateServiceOrderImage: {
    method: 'POST',
    path: '/api/app/admin/service-orders/images',
    description: 'Create admin service order image',
  },
  adminUpdateServiceOrderImage: {
    method: 'PUT',
    path: '/api/app/admin/service-orders/images/:id',
    description: 'Update admin service order image',
    params: ['id'],
  },
  adminDeleteServiceOrderImage: {
    method: 'DELETE',
    path: '/api/app/admin/service-orders/images/:id',
    description: 'Delete admin service order image',
    params: ['id'],
  },
  // App Admin - Services
  adminServicesStats: {
    method: 'GET',
    path: '/api/app/admin/services/stats',
    description: 'Get admin service statistics',
  },
  adminServices: {
    method: 'GET',
    path: '/api/app/admin/services',
    description: 'Get admin service list',
  },
  adminCreateService: {
    method: 'POST',
    path: '/api/app/admin/services',
    description: 'Create admin service',
  },
  adminServiceById: {
    method: 'GET',
    path: '/api/app/admin/services/:id',
    description: 'Get admin service detail',
    params: ['id'],
  },
  adminUpdateService: {
    method: 'PUT',
    path: '/api/app/admin/services/:id',
    description: 'Update admin service',
    params: ['id'],
  },
  adminDeleteService: {
    method: 'DELETE',
    path: '/api/app/admin/services/:id',
    description: 'Delete admin service',
    params: ['id'],
  },
  adminUploadServiceImage: {
    method: 'POST',
    path: '/api/app/admin/services/:id/upload-image',
    description: 'Upload admin service image',
    params: ['id'],
  },
  // App Admin - Service Categories
  adminServiceCategoriesStats: {
    method: 'GET',
    path: '/api/app/admin/service-categories/stats',
    description: 'Get admin service category statistics',
  },
  adminServiceCategories: {
    method: 'GET',
    path: '/api/app/admin/service-categories',
    description: 'Get admin service category list',
  },
  adminCreateServiceCategory: {
    method: 'POST',
    path: '/api/app/admin/service-categories',
    description: 'Create admin service category',
  },
  adminServiceCategoryById: {
    method: 'GET',
    path: '/api/app/admin/service-categories/:id',
    description: 'Get admin service category detail',
    params: ['id'],
  },
  adminUpdateServiceCategory: {
    method: 'PUT',
    path: '/api/app/admin/service-categories/:id',
    description: 'Update admin service category',
    params: ['id'],
  },
  adminDeleteServiceCategory: {
    method: 'DELETE',
    path: '/api/app/admin/service-categories/:id',
    description: 'Delete admin service category',
    params: ['id'],
  },
  adminUploadServiceCategoryImage: {
    method: 'POST',
    path: '/api/app/admin/service-categories/:id/upload-image',
    description: 'Upload admin service category image',
    params: ['id'],
  },
  // App Admin - Products
  adminProductsStats: {
    method: 'GET',
    path: '/api/app/admin/products/stats',
    description: 'Get admin product statistics',
  },
  adminProducts: {
    method: 'GET',
    path: '/api/app/admin/products',
    description: 'Get admin product list',
  },
  adminCreateProduct: {
    method: 'POST',
    path: '/api/app/admin/products',
    description: 'Create admin product',
  },
  adminProductById: {
    method: 'GET',
    path: '/api/app/admin/products/:id',
    description: 'Get admin product detail',
    params: ['id'],
  },
  adminUpdateProduct: {
    method: 'PUT',
    path: '/api/app/admin/products/:id',
    description: 'Update admin product',
    params: ['id'],
  },
  adminDeleteProduct: {
    method: 'DELETE',
    path: '/api/app/admin/products/:id',
    description: 'Delete admin product',
    params: ['id'],
  },
  adminProductImages: {
    method: 'GET',
    path: '/api/app/admin/products/:productId/images',
    description: 'Get admin product images',
    params: ['productId'],
  },
  adminCreateProductImage: {
    method: 'POST',
    path: '/api/app/admin/products/images',
    description: 'Create admin product image',
  },
  adminUpdateProductImage: {
    method: 'PUT',
    path: '/api/app/admin/products/images/:id',
    description: 'Update admin product image',
    params: ['id'],
  },
  adminDeleteProductImage: {
    method: 'DELETE',
    path: '/api/app/admin/products/images/:id',
    description: 'Delete admin product image',
    params: ['id'],
  },
  // App Admin - Categories
  adminCategoriesStats: {
    method: 'GET',
    path: '/api/app/admin/categories/stats',
    description: 'Get admin category statistics',
  },
  adminCategories: {
    method: 'GET',
    path: '/api/app/admin/categories',
    description: 'Get admin category list',
  },
  adminCreateCategory: {
    method: 'POST',
    path: '/api/app/admin/categories',
    description: 'Create admin category',
  },
  adminCategoryById: {
    method: 'GET',
    path: '/api/app/admin/categories/:id',
    description: 'Get admin category detail',
    params: ['id'],
  },
  adminUpdateCategory: {
    method: 'PUT',
    path: '/api/app/admin/categories/:id',
    description: 'Update admin category',
    params: ['id'],
  },
  adminDeleteCategory: {
    method: 'DELETE',
    path: '/api/app/admin/categories/:id',
    description: 'Delete admin category',
    params: ['id'],
  },
  adminUploadCategoryImage: {
    method: 'POST',
    path: '/api/app/admin/categories/:id/upload-image',
    description: 'Upload admin category image',
    params: ['id'],
  },
  // App Admin - Offers
  adminOffersStats: {
    method: 'GET',
    path: '/api/app/admin/offers/stats',
    description: 'Get admin offer statistics',
  },
  adminOffers: {
    method: 'GET',
    path: '/api/app/admin/offers',
    description: 'Get admin offer list',
  },
  adminCreateOffer: {
    method: 'POST',
    path: '/api/app/admin/offers',
    description: 'Create admin offer',
  },
  adminOfferById: {
    method: 'GET',
    path: '/api/app/admin/offers/:id',
    description: 'Get admin offer detail',
    params: ['id'],
  },
  adminUpdateOffer: {
    method: 'PUT',
    path: '/api/app/admin/offers/:id',
    description: 'Update admin offer',
    params: ['id'],
  },
  adminDeleteOffer: {
    method: 'DELETE',
    path: '/api/app/admin/offers/:id',
    description: 'Delete admin offer',
    params: ['id'],
  },
  adminUploadOfferImage: {
    method: 'POST',
    path: '/api/app/admin/offers/:id/upload-image',
    description: 'Upload admin offer image',
    params: ['id'],
  },
  adminOfferImages: {
    method: 'GET',
    path: '/api/app/admin/offers/:offerId/images',
    description: 'Get admin offer images',
    params: ['offerId'],
  },
  adminCreateOfferImage: {
    method: 'POST',
    path: '/api/app/admin/offers/images',
    description: 'Create admin offer image',
  },
  adminUpdateOfferImage: {
    method: 'PUT',
    path: '/api/app/admin/offers/images/:id',
    description: 'Update admin offer image',
    params: ['id'],
  },
  adminDeleteOfferImage: {
    method: 'DELETE',
    path: '/api/app/admin/offers/images/:id',
    description: 'Delete admin offer image',
    params: ['id'],
  },
  // App Admin - Warranties
  adminWarrantiesStats: {
    method: 'GET',
    path: '/api/app/admin/warranties/stats',
    description: 'Get admin warranty statistics',
  },
  adminWarranties: {
    method: 'GET',
    path: '/api/app/admin/warranties',
    description: 'Get admin warranty list',
  },
  adminCreateWarranty: {
    method: 'POST',
    path: '/api/app/admin/warranties',
    description: 'Create admin warranty',
  },
  adminWarrantyById: {
    method: 'GET',
    path: '/api/app/admin/warranties/:id',
    description: 'Get admin warranty detail',
    params: ['id'],
  },
  adminUpdateWarranty: {
    method: 'PUT',
    path: '/api/app/admin/warranties/:id',
    description: 'Update admin warranty',
    params: ['id'],
  },
  adminDeleteWarranty: {
    method: 'DELETE',
    path: '/api/app/admin/warranties/:id',
    description: 'Delete admin warranty',
    params: ['id'],
  },
  // App Admin - Vehicles
  adminVehiclesStats: {
    method: 'GET',
    path: '/api/app/admin/vehicles/stats',
    description: 'Get admin vehicle statistics',
  },
  adminVehicleSearch: {
    method: 'GET',
    path: '/api/app/admin/vehicles/search',
    description: 'Search vehicles in admin scope',
  },
  adminVehicles: {
    method: 'GET',
    path: '/api/app/admin/vehicles',
    description: 'Get admin vehicle list',
  },
  adminVehicleById: {
    method: 'GET',
    path: '/api/app/admin/vehicles/:id',
    description: 'Get admin vehicle detail',
    params: ['id'],
  },
  adminUpdateVehicle: {
    method: 'PUT',
    path: '/api/app/admin/vehicles/:id',
    description: 'Update admin vehicle',
    params: ['id'],
  },
  adminDeleteVehicle: {
    method: 'DELETE',
    path: '/api/app/admin/vehicles/:id',
    description: 'Delete admin vehicle',
    params: ['id'],
  },
  adminUploadVehicleImage: {
    method: 'POST',
    path: '/api/app/admin/vehicles/:id/upload-image',
    description: 'Upload admin vehicle image',
    params: ['id'],
  },
  adminVehicleInspection: {
    method: 'GET',
    path: '/api/app/admin/vehicles/:vehicleId/inspection',
    description: 'Get admin vehicle inspection',
    params: ['vehicleId'],
  },
  adminUpsertVehicleInspection: {
    method: 'PUT',
    path: '/api/app/admin/vehicles/:vehicleId/inspection',
    description: 'Create or update admin vehicle inspection',
    params: ['vehicleId'],
  },
  adminDeleteVehicleInspection: {
    method: 'DELETE',
    path: '/api/app/admin/vehicles/:vehicleId/inspection',
    description: 'Delete admin vehicle inspection',
    params: ['vehicleId'],
  },
  // App Admin - Notifications
  adminNotificationsStats: {
    method: 'GET',
    path: '/api/app/admin/notifications/stats',
    description: 'Get admin notification statistics',
  },
  adminNotificationLogs: {
    method: 'GET',
    path: '/api/app/admin/notifications/logs',
    description: 'Get admin notification logs',
  },
  adminNotifications: {
    method: 'GET',
    path: '/api/app/admin/notifications',
    description: 'Get admin notification list',
  },
  adminCreateNotification: {
    method: 'POST',
    path: '/api/app/admin/notifications',
    description: 'Create admin notification',
  },
  // App Admin - Settings
  adminServiceReminderConfigs: {
    method: 'GET',
    path: '/api/app/admin/settings/service-reminder-configs',
    description: 'Get admin service reminder configs',
  },
  adminUpdateServiceReminderConfig: {
    method: 'PUT',
    path: '/api/app/admin/settings/service-reminder-configs/:service_id',
    description: 'Update admin service reminder config',
    params: ['service_id'],
  },
  adminToggleServiceReminderConfig: {
    method: 'PATCH',
    path: '/api/app/admin/settings/service-reminder-configs/:service_id/enabled',
    description: 'Toggle admin service reminder config',
    params: ['service_id'],
  },
  adminUiVisibility: {
    method: 'GET',
    path: '/api/app/admin/settings/ui-visibility',
    description: 'Get admin UI visibility settings',
  },
  adminUpdateUiVisibility: {
    method: 'PUT',
    path: '/api/app/admin/settings/ui-visibility',
    description: 'Update admin UI visibility settings',
  },
  // App Admin - Garages
  adminGarages: {
    method: 'GET',
    path: '/api/app/admin/garages',
    description: 'Get super admin garage list',
  },
  adminCreateGarage: {
    method: 'POST',
    path: '/api/app/admin/garages',
    description: 'Create super admin garage',
  },
  adminGarageById: {
    method: 'GET',
    path: '/api/app/admin/garages/:id',
    description: 'Get super admin garage detail',
    params: ['id'],
  },
  adminUpdateGarage: {
    method: 'PUT',
    path: '/api/app/admin/garages/:id',
    description: 'Update super admin garage',
    params: ['id'],
  },
  adminPatchGarage: {
    method: 'PATCH',
    path: '/api/app/admin/garages/:id',
    description: 'Patch super admin garage',
    params: ['id'],
  },
  adminDeleteGarage: {
    method: 'DELETE',
    path: '/api/app/admin/garages/:id',
    description: 'Delete super admin garage',
    params: ['id'],
  },
  getEmployeeOrders: {
    method: 'GET',
    path: '/api/app/employee/orders',
    description: 'Get employee orders',
    params: ['status'],
  },
  getEmployeeOrderDetails: {
    method: 'GET',
    path: '/api/app/employee/orders/:id',
    description: 'Get employee order details',
  },
  getAssignedOrders: {
    method: 'GET',
    path: '/api/app/employee/orders/assigned',
    description: 'Get assigned employee orders',
    params: ['status'],
  },
  getAvailableEmployeeOrders: {
    method: 'GET',
    path: '/api/app/employee/orders/available',
    description: 'Get available employee orders',
    params: ['page', 'limit', 'search'],
  },
  claimEmployeeOrder: {
    method: 'POST',
    path: '/api/app/employee/orders/:id/claim',
    description: 'Claim an available service order',
    params: ['id'],
    body: ['employee_id'],
  },
  updateEmployeeOrderStatus: {
    method: 'PUT',
    path: '/api/app/employee/orders/:id/status',
    description: 'Update service order status by employee',
    body: ['status'],
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
  // Service Categories
  getServiceCategories: {
    method: 'GET',
    path: '/api/app/garages/:garageCode/service-categories',
    description: 'Get service categories by garage code',
    params: ['garageCode'],
  },
  getServiceCategoryById: {
    method: 'GET',
    path: '/api/app/garages/:garageCode/service-categories/:id',
    description: 'Get service category by ID with services (required params: garageCode, id; no body)',
    params: ['garageCode', 'id'],
  },
  createServiceCategory: {
    method: 'POST',
    path: '/service-categories/admin',
    description: 'Create service category (required body: name)',
    body: ['name'],
  },
  updateServiceCategory: {
    method: 'PUT',
    path: '/service-categories/admin/:id',
    description: 'Update service category (required param: id; optional body: name, description, image_url)',
    params: ['id'],
    body: ['name', 'description', 'image_url'],
  },
  deleteServiceCategory: {
    method: 'DELETE',
    path: '/service-categories/admin/:id',
    description: 'Delete service category (required param: id; no body)',
    params: ['id'],
  },
  uploadServiceCategoryImage: {
    method: 'POST',
    path: '/service-categories/admin/:id/upload-image',
    description: 'Upload image for service category (required param: id; required body: image file)',
    params: ['id'],
  },
  getServiceCategoryStats: {
    method: 'GET',
    path: '/service-categories/admin/stats',
    description: 'Get service category statistics (no body)',
  },
  // Service
  getServicesAdmin: {
    method: 'GET',
    path: '/services',
    description: 'Get all services (no body)',
  },
  getServiceById: {
    method: 'GET',
    path: '/api/app/garages/:garageCode/services/:id',
    description: 'Get service by ID (required param: id; no body)',
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
    path: '/api/app/garages/:garageCode/products',
    description: 'Get products by garage code',
    params: ['garageCode'],
  },
  getProductById: {
    method: 'GET',
    path: '/api/app/garages/:garageCode/products/:id',
    description: 'Get product by ID with images (required params: garageCode, id; no body)',
    params: ['garageCode', 'id'],
  },
  getProductImages: {
    method: 'GET',
    path: '/api/app/garages/:garageCode/products/:productId/images',
    description: 'Get product images (required params: garageCode, productId; no body)',
    params: ['garageCode', 'productId'],
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
  // Product Reviews
  getProductReviews: {
    method: 'GET',
    path: '/api/product-reviews',
    description: 'Get product reviews (required param: product_id; optional params: approved_only, rating, page, limit)',
    params: ['product_id', 'approved_only', 'rating', 'page', 'limit'],
  },
  getProductReviewStats: {
    method: 'GET',
    path: '/api/product-reviews/products/:id/stats',
    description: 'Get product review statistics (required param: id; no body)',
    params: ['id'],
  },
  createProductReview: {
    method: 'POST',
    path: '/api/product-reviews',
    description: 'Create product review (required body: product_id, customer_id, rating, content)',
    body: ['product_id', 'customer_id', 'rating', 'content'],
  },
  markReviewHelpful: {
    method: 'POST',
    path: '/api/product-reviews/:id/helpful',
    description: 'Mark review as helpful (required param: id; required body: customer_id)',
    params: ['id'],
    body: ['customer_id'],
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
  // Notification (app namespace)
  getCustomerNotifications: {
    method: 'GET',
    path: '/api/app/customer/notifications',
    description: 'Get customer notifications (required context: customer_id)',
    params: ['customer_id', 'is_read', 'limit', 'offset'],
  },
  getCustomerUnreadCount: {
    method: 'GET',
    path: '/api/app/customer/notifications/unread-count',
    description: 'Count customer unread notifications (required context: customer_id)',
    params: ['customer_id'],
  },
  markCustomerNotificationRead: {
    method: 'PUT',
    path: '/api/app/customer/notifications/:id/read',
    description: 'Mark customer notification as read (required param: id; no body)',
  },
  markAllCustomerNotificationsRead: {
    method: 'PUT',
    path: '/api/app/customer/notifications/read-all',
    description: 'Mark all customer notifications as read (required context: customer_id)',
    body: ['customer_id'],
  },
  deleteCustomerNotification: {
    method: 'DELETE',
    path: '/api/app/customer/notifications/:id',
    description: 'Delete customer notification (required param: id; no body)',
  },
  getEmployeeNotifications: {
    method: 'GET',
    path: '/api/app/employee/notifications',
    description: 'Get employee notifications',
    params: ['is_read', 'limit', 'offset'],
  },
  getEmployeeUnreadCount: {
    method: 'GET',
    path: '/api/app/employee/notifications/unread-count',
    description: 'Count employee unread notifications',
  },
  markEmployeeNotificationRead: {
    method: 'PUT',
    path: '/api/app/employee/notifications/:id/read',
    description: 'Mark employee notification as read (required param: id; no body)',
  },
  markAllEmployeeNotificationsRead: {
    method: 'PUT',
    path: '/api/app/employee/notifications/read-all',
    description: 'Mark all employee notifications as read',
  },
  deleteEmployeeNotification: {
    method: 'DELETE',
    path: '/api/app/employee/notifications/:id',
    description: 'Delete employee notification (required param: id; no body)',
  },
  getDealerNotifications: {
    method: 'GET',
    path: '/api/app/dealer/notifications',
    description: 'Get dealer notifications',
    params: ['is_read', 'limit', 'offset'],
  },
  getDealerUnreadCount: {
    method: 'GET',
    path: '/api/app/dealer/notifications/unread-count',
    description: 'Count dealer unread notifications',
  },
  createNotification: {
    method: 'POST',
    path: '/notifications',
    description: 'Create notification in legacy admin scope',
  },
  markDealerNotificationRead: {
    method: 'PUT',
    path: '/api/app/dealer/notifications/:id/read',
    description: 'Mark dealer notification as read (required param: id; no body)',
  },
  markAllDealerNotificationsRead: {
    method: 'PUT',
    path: '/api/app/dealer/notifications/read-all',
    description: 'Mark all dealer notifications as read',
  },
  deleteDealerNotification: {
    method: 'DELETE',
    path: '/api/app/dealer/notifications/:id',
    description: 'Delete dealer notification (required param: id; no body)',
  },
  // FCM Token Management
  registerFcmToken: {
    method: 'POST',
    path: '/api/app/fcm-tokens/register',
    description: 'Register/Update FCM token (required body: user_id, user_type, token, device_info)',
    body: ['user_id', 'user_type', 'token', 'device_info'],
  },
  refreshFcmToken: {
    method: 'POST',
    path: '/api/app/fcm-tokens/refresh',
    description: 'Refresh existing FCM token binding (required body: token)',
    body: ['token'],
  },
  getUserFcmTokens: {
    method: 'GET',
    path: '/api/app/fcm-tokens/user',
    description: 'Get all FCM tokens for a user (required params: user_id, user_type)',
    params: ['user_id', 'user_type'],
  },
  deleteFcmToken: {
    method: 'DELETE',
    path: '/api/app/fcm-tokens',
    description: 'Delete FCM token on logout (required body: token)',
    body: ['token'],
  },
  getActiveFcmTokens: {
    method: 'GET',
    path: '/api/app/fcm-tokens/active',
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
  // Customer aggregate offers
  getOffers: {
    method: 'GET',
    path: '/api/app/customer/offers',
    description: 'Get offers from all garages linked to the customer',
    params: ['customer_id', 'page', 'limit'],
  },
  getOfferById: {
    method: 'GET',
    path: '/api/app/customer/offers/:id',
    description: 'Get a customer offer with images and garage details',
    params: ['id', 'customer_id'],
  },
  getOfferImages: {
    method: 'GET',
    path: '/api/app/customer/offers/:id/images',
    description: 'Get images for a customer offer',
    params: ['id', 'customer_id'],
  },
  createOffer: {
    method: 'POST',
    path: '/offers',
    description: 'Create offer (required body: name, service_id)',
    body: ['name', 'service_id'],
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
  // Dealer Categories
  getDealerCategories: {
    method: 'GET',
    path: '/api/app/dealer/categories',
    description: 'Get all dealer categories (no body)',
  },
  createDealerCategory: {
    method: 'POST',
    path: '/api/app/dealer/categories',
    description: 'Create dealer category (required body: name)',
    body: ['name'],
  },
  getDealerCategoryById: {
    method: 'GET',
    path: '/api/app/dealer/categories/:id',
    description: 'Get dealer category by ID with dealer products (required param: id; no body)',
  },
  updateDealerCategory: {
    method: 'PUT',
    path: '/api/app/dealer/categories/:id',
    description: 'Update dealer category (required param: id; optional body: name, description, image_url)',
    body: ['name', 'description', 'image_url'],
  },
  deleteDealerCategory: {
    method: 'DELETE',
    path: '/api/app/dealer/categories/:id',
    description: 'Delete dealer category (required param: id; no body)',
  },
  // Dealer Products
  getDealerProducts: {
    method: 'GET',
    path: '/api/app/dealer/products',
    description: 'Get all dealer products with images (no body)',
  },
  getDealerProductById: {
    method: 'GET',
    path: '/api/app/dealer/products/:id',
    description: 'Get dealer product by ID with images (required param: id; no body)',
  },
  getDealerProductImages: {
    method: 'GET',
    path: '/api/app/dealer/products/:productId/images',
    description: 'Get dealer product images (required param: productId; no body)',
  },
  createDealerProduct: {
    method: 'POST',
    path: '/api/app/dealer/products',
    description: 'Create dealer product (required body: name, price, category_id)',
    body: ['name', 'price', 'category_id'],
  },
  updateDealerProduct: {
    method: 'PUT',
    path: '/api/app/dealer/products/:id',
    description: 'Update dealer product (required param: id; optional body: name, description, price, category_id, video_url)',
    body: ['name', 'description', 'price', 'category_id', 'video_url'],
  },
  deleteDealerProduct: {
    method: 'DELETE',
    path: '/api/app/dealer/products/:id',
    description: 'Delete dealer product (required param: id; no body)',
  },
  createDealerProductImage: {
    method: 'POST',
    path: '/api/app/dealer/products/images',
    description: 'Create dealer product image (required body: product_id, image_url)',
    body: ['product_id', 'image_url'],
  },
  updateDealerProductImage: {
    method: 'PUT',
    path: '/api/app/dealer/products/images/:id',
    description: 'Update dealer product image (required param: id; optional body: image_url, is_primary)',
    body: ['image_url', 'is_primary'],
  },
  deleteDealerProductImage: {
    method: 'DELETE',
    path: '/api/app/dealer/products/images/:id',
    description: 'Delete dealer product image (required param: id; no body)',
  },
  // Categories
  getCategories: {
    method: 'GET',
    path: '/api/app/garages/:garageCode/categories',
    description: 'Get product categories by garage code',
    params: ['garageCode'],
  },
  createCategory: {
    method: 'POST',
    path: '/categories',
    description: 'Create category (required body: name)',
    body: ['name'],
  },
  getCategoryById: {
    method: 'GET',
    path: '/api/app/garages/:garageCode/categories/:id',
    description: 'Get product category by ID with products (required params: garageCode, id; no body)',
    params: ['garageCode', 'id'],
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
    params: ['id'],
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
