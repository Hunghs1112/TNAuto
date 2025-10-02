// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  userType: 'customer' | 'employee' | null;
  userId: string;
  userName: string;
  userPhone: string;
  userLicensePlate: string;
  avatarUrl: string;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userType: null,
  userId: '',
  userName: '',
  userPhone: '',
  userLicensePlate: '',
  avatarUrl: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean; userType: 'customer' | 'employee'; userId: string; userName: string; userPhone: string; userLicensePlate: string; avatarUrl: string }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.userType = action.payload.userType;
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.userPhone = action.payload.userPhone;
      state.userLicensePlate = action.payload.userLicensePlate;
      state.avatarUrl = action.payload.avatarUrl;
      console.log('authSlice: setLoggedIn with avatarUrl:', action.payload.avatarUrl); // Debug
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userType = null;
      state.userId = '';
      state.userName = '';
      state.userPhone = '';
      state.userLicensePlate = '';
      state.avatarUrl = '';
      console.log('authSlice: logout - cleared avatarUrl'); // Debug
    },
  },
});

export const { setLoggedIn, logout } = authSlice.actions;
export default authSlice.reducer;