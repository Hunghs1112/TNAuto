import { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { AppDispatch } from '../stores';

// Global tracking to prevent spamming across different screens
let lastGlobalRefreshTime = 0;
const GLOBAL_COOLDOWN = 30000; // 30 seconds cooldown

import { customerApi } from '../../services/customerApi';
import { offerApi } from '../../services/offerApi';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import { dealerProductApi } from '../../services/dealerProductApi';
import { dealerCategoryApi } from '../../services/dealerCategoryApi';
import { serviceOrderApi } from '../../services/serviceOrderApi';
import { serviceApi } from '../../services/serviceApi';
import { notificationApi } from '../../services/notificationApi';
import { employeeApi } from '../../services/employeeApi';
import { warrantyApi } from '../../services/warrantyApi';
import { vehicleApi } from '../../services/vehicleApi';

type TagTypes = 
  | 'Customer' 
  | 'Offer' 
  | 'Product' 
  | 'Category'
  | 'ServiceOrder' 
  | 'Service' 
  | 'Notification' 
  | 'Employee'
  | 'Warranty'
  | 'Vehicle';

interface UseAutoRefreshOptions {
  /**
   * Specific tags to refresh (if not provided, refreshes all)
   */
  tags?: TagTypes[];
  
  /**
   * Automatically refresh when screen comes into focus
   * Default: true
   */
  autoRefreshOnFocus?: boolean;

  /**
   * Cooldown time in milliseconds (default: 30000ms)
   */
  cooldownMs?: number;
}

/**
 * Optimized auto-refresh hook for manual refresh via pull-to-refresh
 * and automatic refresh on navigation focus.
 */
export const useAutoRefresh = (options: UseAutoRefreshOptions = {}) => {
  const {
    tags,
    autoRefreshOnFocus = true,
    cooldownMs = GLOBAL_COOLDOWN,
  } = options;
  
  const dispatch = useDispatch<AppDispatch>();
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(async (force = false) => {
    const now = Date.now();
    // Only apply cooldown if not a forced manual refresh
    if (!force && now - lastGlobalRefreshTime < cooldownMs) {
      return;
    }
    
    lastGlobalRefreshTime = now;
    setRefreshing(true);

    try {
      const apiSlices = [
        { tag: 'Customer', api: customerApi },
        { tag: 'Offer', api: offerApi },
        { tag: 'Product', api: productApi },
        { tag: 'Category', api: categoryApi },
        { tag: 'Product', api: dealerProductApi },
        { tag: 'Category', api: dealerCategoryApi },
        { tag: 'ServiceOrder', api: serviceOrderApi },
        { tag: 'Service', api: serviceApi },
        { tag: 'Notification', api: notificationApi },
        { tag: 'Employee', api: employeeApi },
        { tag: 'Warranty', api: warrantyApi },
        { tag: 'Vehicle', api: vehicleApi },
      ];

      apiSlices.forEach(({ tag, api }) => {
        if (!tags || tags.includes(tag as TagTypes)) {
          dispatch(api.util.invalidateTags([tag as any]));
        }
      });
      
      // Small delay to let RTK Query start its fetches
      setTimeout(() => setRefreshing(false), 500);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  }, [dispatch, tags, cooldownMs]);

  // Auto-refresh when screen is focused
  useEffect(() => {
    if (isFocused && autoRefreshOnFocus) {
      refreshData(false);
    }
  }, [isFocused, autoRefreshOnFocus, refreshData]);

  return { 
    refreshing, 
    onRefresh: () => refreshData(true) 
  };
};
