// src/redux/hooks/useAppSelector.ts
import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../types';

/**
 * Optimized selector hook with shallow equality check to prevent unnecessary re-renders
 * Use this instead of useSelector directly for better performance
 */
export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) => useSelector<RootState, TSelected>(selector, equalityFn || shallowEqual);