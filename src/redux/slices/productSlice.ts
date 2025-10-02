// src/store/slices/productSlice.ts (New: Redux slice to manage fetched product data beyond RTK Query cache, e.g., for local mutations or derived state)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../services/productApi'; // Adjust path if needed

interface ProductState {
  products: Product[];
  selectedProduct?: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      console.log('setProducts action:', action.payload); // Debug
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      console.log('addProduct action:', action.payload); // Debug
      state.products.unshift(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      console.log('updateProduct action:', action.payload); // Debug
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      console.log('deleteProduct action:', action.payload); // Debug
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      console.log('setSelectedProduct action:', action.payload); // Debug
      state.selectedProduct = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('setLoading action:', action.payload); // Debug
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.log('setError action:', action.payload); // Debug
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { 
  setProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  setSelectedProduct, 
  setLoading, 
  setError 
} = productSlice.actions;

export default productSlice.reducer;