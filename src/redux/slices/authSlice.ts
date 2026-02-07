// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  userType: 'customer' | 'employee' | 'dealer' | null;
  userId: string;
  userName: string;
  userPhone: string;
  userLicensePlate: string;
  avatarUrl: string;
  userEmail?: string;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userType: null,
  userId: '',
  userName: '',
  userPhone: '',
  userLicensePlate: '',
  avatarUrl: '',
  userEmail: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean; userType: 'customer' | 'employee' | 'dealer'; userId: string; userName: string; userPhone: string; userLicensePlate: string; avatarUrl: string; userEmail?: string }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.userType = action.payload.userType;
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.userPhone = action.payload.userPhone;
      state.userLicensePlate = action.payload.userLicensePlate;
      state.avatarUrl = action.payload.avatarUrl;
      state.userEmail = action.payload.userEmail || '';
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userType = null;
      state.userId = '';
      state.userName = '';
      state.userPhone = '';
      state.userLicensePlate = '';
      state.avatarUrl = '';
      state.userEmail = '';
    },
    updateUserProfile: (state, action: PayloadAction<{ userName?: string; avatarUrl?: string; userEmail?: string }>) => {
      if (action.payload.userName !== undefined) {
        state.userName = action.payload.userName;
      }
      if (action.payload.avatarUrl !== undefined) {
        state.avatarUrl = action.payload.avatarUrl;
      }
      if (action.payload.userEmail !== undefined) {
        state.userEmail = action.payload.userEmail;
      }
    },
  },
});

export const { setLoggedIn, logout, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;