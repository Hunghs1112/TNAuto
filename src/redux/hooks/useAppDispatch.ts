// src/redux/hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../types';

export const useAppDispatch = () => useDispatch<AppDispatch>();