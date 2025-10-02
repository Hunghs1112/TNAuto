// src/redux/slices/customerSlice.ts (Updated: Added avatar_url to Customer interface)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  license_plate?: string;
  avatar_url?: string;
}

interface CustomerState {
  customer: Customer | null;
  isFetching: boolean;
}

const initialState: CustomerState = {
  customer: null,
  isFetching: false,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomer: (state, action: PayloadAction<Customer>) => {
      console.log('customerSlice: setCustomer:', action.payload); // Debug
      state.customer = action.payload;
      state.isFetching = false;
    },
    setFetching: (state, action: PayloadAction<boolean>) => {
      console.log('customerSlice: setFetching:', action.payload); // Debug
      state.isFetching = action.payload;
    },
    clearCustomer: (state) => {
      console.log('customerSlice: clearCustomer'); // Debug
      state.customer = null;
    },
  },
});

export const { setCustomer, setFetching, clearCustomer } = customerSlice.actions;
export default customerSlice.reducer;