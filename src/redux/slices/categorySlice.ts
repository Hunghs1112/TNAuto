// src/redux/slices/categorySlice.ts
import { createGenericSlice } from './createGenericSlice';
import { Category } from '../../services/categoryApi';

// Tạo slice sử dụng factory pattern để giảm code duplication
const categorySlice = createGenericSlice<Category>('category');

// Export với tên phù hợp
export const {
  setItems: setCategories,
  addItem: addCategory,
  updateItem: updateCategory,
  removeItem: removeCategory,
  setSelectedItem: setSelectedCategory,
  setLoading,
  setError,
  clearItems: clearCategories,
} = categorySlice.actions;

export default categorySlice.reducer;

