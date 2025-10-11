// src/hooks/useAutoRefresh.ts (Optimized hook for auto-refresh and pull-to-refresh)
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../stores';

import { customerApi } from '../../services/customerApi';
import { offerApi } from '../../services/offerApi';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import { serviceOrderApi } from '../../services/serviceOrderApi';
import { serviceApi } from '../../services/serviceApi';
import { notificationApi } from '../../services/notificationApi';
import { employeeApi } from '../../services/employeeApi';
import { warrantyApi } from '../../services/warrantyApi';

type TagTypes = 
  | 'Customer' 
  | 'Offer' 
  | 'Product' 
  | 'Category'
  | 'ServiceOrder' 
  | 'Service' 
  | 'Notification' 
  | 'Employee'
  | 'Warranty';

interface UseAutoRefreshOptions {
  /**
   * Specific tags to refresh (if not provided, refreshes all)
   */
  tags?: TagTypes[];
  
  /**
   * Disable auto-refresh on screen focus (default: true)
   * Set to false to enable auto-refresh on focus
   */
  disableAutoRefresh?: boolean;
}

/**
 * Optimized auto-refresh hook for manual refresh via pull-to-refresh
 * 
 * Usage:
 * ```tsx
 * // Refresh all data
 * const { refreshing, onRefresh } = useAutoRefresh();
 * 
 * // Refresh specific data only
 * const { refreshing, onRefresh } = useAutoRefresh({ 
 *   tags: ['Product', 'Category'] 
 * });
 * ```
 */
export const useAutoRefresh = (options: UseAutoRefreshOptions = {}) => {
  const { tags, disableAutoRefresh = true } = options;
  const dispatch = useDispatch<AppDispatch>();
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    setRefreshing(true);
    console.log('Manual refresh triggered', tags ? `for tags: ${tags.join(', ')}` : 'for all data');
    
    try {
      // If specific tags provided, only invalidate those
      if (tags && tags.length > 0) {
        tags.forEach(tag => {
          switch (tag) {
            case 'Customer':
              dispatch(customerApi.util.invalidateTags(['Customer']));
              break;
            case 'Offer':
              dispatch(offerApi.util.invalidateTags(['Offer']));
              break;
            case 'Product':
              dispatch(productApi.util.invalidateTags(['Product']));
              break;
            case 'Category':
              dispatch(categoryApi.util.invalidateTags(['Category']));
              break;
            case 'ServiceOrder':
              dispatch(serviceOrderApi.util.invalidateTags(['ServiceOrder']));
              break;
            case 'Service':
              dispatch(serviceApi.util.invalidateTags(['Service']));
              break;
            case 'Notification':
              dispatch(notificationApi.util.invalidateTags(['Notification']));
              break;
            case 'Employee':
              dispatch(employeeApi.util.invalidateTags(['Employee']));
              break;
            case 'Warranty':
              dispatch(warrantyApi.util.invalidateTags(['Warranty']));
              break;
          }
        });
      } else {
        // Invalidate all tags
        dispatch(customerApi.util.invalidateTags(['Customer']));
        dispatch(offerApi.util.invalidateTags(['Offer']));
        dispatch(productApi.util.invalidateTags(['Product']));
        dispatch(categoryApi.util.invalidateTags(['Category']));
        dispatch(serviceOrderApi.util.invalidateTags(['ServiceOrder']));
        dispatch(serviceApi.util.invalidateTags(['Service']));
        dispatch(notificationApi.util.invalidateTags(['Notification']));
        dispatch(employeeApi.util.invalidateTags(['Employee']));
        dispatch(warrantyApi.util.invalidateTags(['Warranty']));
      }
      
      // Small delay to show refresh animation
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, tags, refreshing]);

  // Note: Removed useFocusEffect to prevent auto-refresh on screen focus
  // Data will be cached and only refreshed manually via pull-to-refresh
  // or automatically based on RTK Query's refetchOnMountOrArgChange setting

  return { 
    refreshing, 
    onRefresh: refreshData 
  };
};