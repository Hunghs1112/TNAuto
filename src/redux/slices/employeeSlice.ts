// src/redux/slices/employeeSlice.ts (Updated: Added avatar_url to Employee interface)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Employee {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  created_at?: string;
}

interface EmployeeState {
  currentEmployee: Employee | null;
}

const initialState: EmployeeState = {
  currentEmployee: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setCurrentEmployee: (state, action: PayloadAction<Employee>) => {
      console.log('Setting current employee:', action.payload); // Debug
      state.currentEmployee = action.payload;
    },
    clearCurrentEmployee: (state) => {
      console.log('Clearing current employee'); // Debug
      state.currentEmployee = null;
    },
  },
});

export const { setCurrentEmployee, clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;