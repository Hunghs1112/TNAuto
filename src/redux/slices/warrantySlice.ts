// src/redux/slices/warrantySlice.ts
import { createGenericSlice } from './createGenericSlice';

export interface Warranty {
  id: number;
  order_id: number;
  customer_id: number;
  warranty_period: number;
  start_date: string;
  end_date: string;
  note?: string;
  created_at: string;
  updated_at: string;
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