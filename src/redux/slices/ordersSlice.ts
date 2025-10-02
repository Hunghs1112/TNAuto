// src/redux/slices/ordersSlice.ts (Updated: Expand ServiceOrder to ExtendedServiceOrder for full data)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExtendedServiceOrder {
  id: number;
  customer_id: number;
  service_id: number;
  license_plate: string;
  receive_date: string;
  status?: string;
  vehicle_type?: string | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  address?: string | null;
  delivery_date?: string | null;
  note?: string | null;
  created_at?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_license_plate?: string;
  employee_name?: string | null;
  service_name?: string;
  service_description?: string;
  estimated_time?: number;
  image_count?: number;
}

interface OrdersState {
  orders: ExtendedServiceOrder[];
  isFetching: boolean;
}

const initialState: OrdersState = {
  orders: [],
  isFetching: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<ExtendedServiceOrder[]>) => {
      console.log('ordersSlice: setOrders:', action.payload.length); // Debug
      state.orders = action.payload;
      state.isFetching = false;
    },
    addOrder: (state, action: PayloadAction<ExtendedServiceOrder>) => {
      console.log('ordersSlice: addOrder:', action.payload.id); // Debug
      state.orders.unshift(action.payload);
    },
    setFetching: (state, action: PayloadAction<boolean>) => {
      console.log('ordersSlice: setFetching:', action.payload); // Debug
      state.isFetching = action.payload;
    },
    clearOrders: (state) => {
      console.log('ordersSlice: clearOrders'); // Debug
      state.orders = [];
    },
  },
});

export const { setOrders, addOrder, setFetching, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;