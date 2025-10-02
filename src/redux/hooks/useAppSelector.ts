// src/redux/hooks/useAppSelector.ts
import { useSelector } from 'react-redux';
import type { RootState } from '../types';

export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected
) => useSelector<RootState, TSelected>(selector);