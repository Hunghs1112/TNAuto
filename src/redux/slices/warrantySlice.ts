// src/redux/slices/warrantySlice.ts
import { createGenericSlice } from './createGenericSlice';

export interface Warranty {
  id: number;
  order_id: number;
  service_id?: number | null;
  product_id?: number | null;
  dealer_id?: number | null;
  warranty_period: number;
  start_date: string;
  end_date: string;
  warranty_type?: string | null;
  warranty_status?: string | null;
  days_remaining?: number | null;
  license_plate?: string | null;
  service_name?: string | null;
  product_name?: string | null;
  dealer_name?: string | null;
}

// Tạo slice sử dụng factory pattern để giảm code duplication
const warrantySlice = createGenericSlice<Warranty>('warranty');

// Export với tên phù hợp
export const {
  setItems: setWarranties,
  addItem: addWarranty,
  updateItem: updateWarranty,
  removeItem: removeWarranty,
  setSelectedItem: setSelectedWarranty,
  setLoading,
  setError,
  clearItems: clearWarranties,
} = warrantySlice.actions;

export default warrantySlice.reducer;
