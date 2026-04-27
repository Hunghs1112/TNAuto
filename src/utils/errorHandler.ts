// src/utils/errorHandler.ts
/**
 * Error handling utilities for API errors
 * 
 * This module provides functions to handle API errors gracefully with:
 * - Vietnamese error messages
 * - Fallback to cached data when available
 * - Integration with React Native Alert
 * 
 * @example
 * ```typescript
 * import { handleApiError, getErrorMessage } from '@/utils/errorHandler';
 * 
 * // Example 1: Handle API error with cached data fallback
 * try {
 *   const data = await fetchOrders();
 *   return data;
 * } catch (error) {
 *   return handleApiError(error, cachedOrders);
 * }
 * 
 * // Example 2: Get error message only
 * try {
 *   await updateOrder(orderId);
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   Alert.alert('Lỗi', message);
 * }
 * 
 * // Example 3: Handle 401 errors with navigation
 * try {
 *   const data = await fetchData();
 * } catch (error) {
 *   if (error.status === 401) {
 *     navigation.navigate('Login');
 *   } else {
 *     handleApiError(error, cachedData);
 *   }
 * }
 * ```
 */
import { Alert } from 'react-native';

/**
 * API Error type definition
 */
export interface ApiError {
  status?: number;
  data?: {
    error?: string;
    message?: string;
  };
  message?: string;
}

/**
 * Handle API errors with fallback to cached data
 * 
 * @param error - The API error object
 * @param cachedData - Optional cached data to use as fallback
 * @returns The cached data if available, otherwise null
 * 
 * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
 */
export function handleApiError(error: ApiError, cachedData?: any): any {
  // Log error for debugging
  console.error('[ErrorHandler] API Error:', error);
  
  // Check error type and handle accordingly
  if (error.status === 401) {
    // For 401 errors, we don't show toast here
    // The navigation to login should be handled by the caller
    return null;
  }
  
  // Get user-friendly error message
  const message = getErrorMessage(error);
  
  // If cached data is available, show warning and return cached data
  if (cachedData) {
    Alert.alert(
      'Cảnh báo',
      `${message}\n\nHiển thị dữ liệu đã lưu.`,
      [{ text: 'OK' }]
    );
    return cachedData;
  }
  
  // No cached data, show error message with retry option
  Alert.alert(
    'Lỗi',
    message,
    [{ text: 'OK' }]
  );
  
  return null;
}

/**
 * Get user-friendly error message in Vietnamese
 * 
 * @param error - The API error object
 * @returns Vietnamese error message
 * 
 * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
 */
export function getErrorMessage(error: ApiError): string {
  // Check if it's a network error (no status code)
  if (!error.status && !navigator.onLine) {
    return 'Không thể kết nối. Vui lòng kiểm tra mạng';
  }
  
  // Handle specific HTTP status codes
  switch (error.status) {
    case 401:
      return 'Phiên đăng nhập hết hạn';
    
    case 404:
      return 'Không tìm thấy dữ liệu';
    
    case 408:
      return 'Yêu cầu quá lâu. Vui lòng thử lại';
    
    case 500:
    case 502:
    case 503:
      return 'Lỗi hệ thống. Vui lòng thử lại sau';
    
    default:
      // Try to extract error message from response
      if (error.data?.error) {
        return error.data.error;
      }
      if (error.data?.message) {
        return error.data.message;
      }
      if (error.message) {
        return error.message;
      }
      
      // Generic fallback message
      return 'Đã xảy ra lỗi. Vui lòng thử lại';
  }
}
