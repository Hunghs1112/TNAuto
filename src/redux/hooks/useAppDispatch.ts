// src/redux/hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../types';

export const useAppDispatch = () => useDispatch<AppDispatch>();

// Re-export other hooks for convenience
export { useAppSelector } from './useAppSelector';
export { useAutoRefresh } from './useAutoRefresh';
export { usePrefetchData, usePrefetchUserData } from './usePrefetchData';