/**
 * adminMappers.ts — Bước 11 Cleanup
 * Typed interfaces và helper functions để map AdminEntity → typed objects.
 * Thay thế dần các cast `as unknown as X` rải rác trong screens.
 */

import { AdminEntity } from './adminGarageApi';
import { ServiceOrder, Vehicle, Warranty } from '../types/api.types';
import { isSuperGarage } from '../utils/garageHelpers';

// ─── Typed resource interfaces ────────────────────────────────────────────────

export interface AdminServiceOrder {
  id: string;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  employee_id?: string | number | null;
  employee_name?: string | null;
  service_id: number;
  service_name?: string;
  service_image_url?: string | null;
  license_plate: string;
  vehicle_type?: string | null;
  receive_date: string;
  delivery_date?: string | null;
  status: string;
  note?: string | null;
  created_at: string;
  garage_name?: string | null;
  images?: Array<{ id: number; image_url: string; status_at_time: string; description?: string | null; created_at: string }>;
  warranty?: { warranty_end?: string; end_date?: string } | null;
}

export interface AdminWarranty {
  id: string | number;
  order_id?: number | null;
  customer_id?: number | null;
  service_id?: number | null;
  service_name?: string;
  employee_name?: string;
  license_plate?: string;
  start_date?: string;
  end_date?: string;
  warranty_end?: string;
  note?: string | null;
  created_at?: string;
}

export interface AdminVehicle {
  id: string | number;
  customer_id?: number;
  license_plate: string;
  model?: string | null;
  image_url?: string | null;
  created_at: string;
  has_active_order?: boolean;
  active_order_count?: number;
}

export interface AdminService {
  id: string | number;
  name: string;
  description?: string;
  estimated_time?: number;
  warranty_period?: number | null;
  image_url?: string | null;
  created_at?: string;
}

export interface AdminProduct {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  primary_image?: string;
  image_url?: string | null;
  created_at?: string;
}

export interface AdminOffer {
  id: string | number;
  name: string;
  description?: string;
  discount?: number;
  valid_from?: string;
  valid_to?: string;
  image_url?: string | null;
  service_name?: string;
  created_at?: string;
}

export interface AdminGarage {
  id: string;
  name: string;
  code: string;
  address: string;
  status: string;
  is_super_garage: boolean;
}

// ─── Mapper helpers ───────────────────────────────────────────────────────────

const str = (v: unknown, fallback = '') => (v !== null && v !== undefined ? String(v) : fallback);
const num = (v: unknown, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };
const bool = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

export const mapAdminServiceOrder = (item: AdminEntity): AdminServiceOrder => ({
  id: str(item.id),
  customer_id: num(item.customer_id),
  customer_name: item.customer_name ? str(item.customer_name) : undefined,
  customer_phone: item.customer_phone ? str(item.customer_phone) : undefined,
  employee_id: item.employee_id != null ? str(item.employee_id) : null,
  employee_name: item.employee_name ? str(item.employee_name) : null,
  service_id: num(item.service_id),
  service_name: item.service_name ? str(item.service_name) : undefined,
  service_image_url: item.service_image_url ? str(item.service_image_url) : null,
  license_plate: str(item.license_plate),
  vehicle_type: item.vehicle_type ? str(item.vehicle_type) : null,
  receive_date: str(item.receive_date),
  delivery_date: item.delivery_date ? str(item.delivery_date) : null,
  status: str(item.status, 'received'),
  note: item.note ? str(item.note) : null,
  created_at: str(item.created_at),
  garage_name: item.garage_name ? str(item.garage_name) : null,
  images: Array.isArray(item.images) ? (item.images as any[]) : undefined,
  warranty: item.warranty as AdminServiceOrder['warranty'] ?? null,
});

export const mapAdminWarranty = (item: AdminEntity): AdminWarranty => ({
  id: str(item.id),
  order_id: item.order_id != null ? num(item.order_id) : null,
  customer_id: item.customer_id != null ? num(item.customer_id) : null,
  service_id: item.service_id != null ? num(item.service_id) : null,
  service_name: item.service_name ? str(item.service_name) : undefined,
  employee_name: item.employee_name ? str(item.employee_name) : undefined,
  license_plate: item.license_plate ? str(item.license_plate) : undefined,
  start_date: item.start_date ? str(item.start_date) : undefined,
  end_date: item.end_date ? str(item.end_date) : undefined,
  warranty_end: item.warranty_end ? str(item.warranty_end) : undefined,
  note: item.note ? str(item.note) : null,
  created_at: item.created_at ? str(item.created_at) : undefined,
});

export const mapAdminVehicle = (item: AdminEntity): AdminVehicle => ({
  id: str(item.id),
  customer_id: item.customer_id != null ? num(item.customer_id) : undefined,
  license_plate: str(item.license_plate),
  model: item.model ? str(item.model) : null,
  image_url: item.image_url ? str(item.image_url) : null,
  created_at: str(item.created_at),
  has_active_order: item.has_active_order != null ? bool(item.has_active_order) : undefined,
  active_order_count: item.active_order_count != null ? num(item.active_order_count) : undefined,
});

export const mapAdminService = (item: AdminEntity): AdminService => ({
  id: str(item.id),
  name: str(item.name, 'Dịch vụ chưa đặt tên'),
  description: item.description ? str(item.description) : undefined,
  estimated_time: item.estimated_time != null ? num(item.estimated_time) : undefined,
  warranty_period: item.warranty_period != null ? num(item.warranty_period) : null,
  image_url: item.image_url ? str(item.image_url) : null,
  created_at: item.created_at ? str(item.created_at) : undefined,
});

export const mapAdminProduct = (item: AdminEntity): AdminProduct => ({
  id: str(item.id),
  name: str(item.name, 'Sản phẩm chưa đặt tên'),
  description: item.description ? str(item.description) : undefined,
  price: num(item.price),
  category_id: item.category_id != null ? num(item.category_id) : undefined,
  primary_image: item.primary_image ? str(item.primary_image) : undefined,
  image_url: item.image_url ? str(item.image_url) : null,
  created_at: item.created_at ? str(item.created_at) : undefined,
});

export const mapAdminOffer = (item: AdminEntity): AdminOffer => ({
  id: str(item.id),
  name: str(item.name, 'Ưu đãi chưa đặt tên'),
  description: item.description ? str(item.description) : undefined,
  discount: item.discount != null ? num(item.discount) : undefined,
  valid_from: item.valid_from ? str(item.valid_from) : undefined,
  valid_to: item.valid_to ? str(item.valid_to) : undefined,
  image_url: item.image_url ? str(item.image_url) : null,
  service_name: item.service_name ? str(item.service_name) : undefined,
  created_at: item.created_at ? str(item.created_at) : undefined,
});

export const mapAdminGarage = (item: AdminEntity): AdminGarage => ({
  id: str(item.id),
  name: str(item.name || item.garage_name, 'Gara chưa đặt tên'),
  code: str(item.code || item.garage_code),
  address: str(item.address),
  status: str(item.status),
  is_super_garage: isSuperGarage(item.is_super_garage),
});

// ─── Convenience: map arrays ──────────────────────────────────────────────────

export const mapAdminServiceOrders = (items: AdminEntity[]) => items.map(mapAdminServiceOrder);
export const mapAdminWarranties = (items: AdminEntity[]) => items.map(mapAdminWarranty);
export const mapAdminVehicles = (items: AdminEntity[]) => items.map(mapAdminVehicle);
export const mapAdminServices = (items: AdminEntity[]) => items.map(mapAdminService);
export const mapAdminProducts = (items: AdminEntity[]) => items.map(mapAdminProduct);
export const mapAdminOffers = (items: AdminEntity[]) => items.map(mapAdminOffer);
export const mapAdminGarages = (items: AdminEntity[]) => items.map(mapAdminGarage);
