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
 *   const result = handleApiError(error, cachedData);
 *   if (result.shouldLogout) {
 *     dispatch(logout());
 *     navigation.navigate('Login');
 *   }
 * }
 * ```
 */
import { Alert } from 'react-native';
import { ApiErrorCode, ApiErrorResponse } from '../types/api.types';

/**
 * API Error type definition
 */
export interface ApiError {
  status?: number;
  data?: ApiErrorResponse;
  message?: string;
}

/**
 * Result type for handleApiError — includes shouldLogout signal for UNAUTHORIZED errors
 */
export interface HandleApiErrorResult {
  message: string;
  shouldLogout: boolean;
  data: any;
}

/**
 * Maps an ApiErrorCode to a Vietnamese user-facing message.
 *
 * Codes with server message fallback: NOT_FOUND, VALIDATION_ERROR, CONFLICT, BAD_REQUEST
 * Codes with fixed message: UNAUTHORIZED, FORBIDDEN, GARAGE_CONTEXT_REQUIRED, INTERNAL_ERROR
 *
 * @param errorCode - The error code from the API response
 * @param serverMessage - Optional server-provided message used as fallback for some codes
 * @returns Vietnamese error message string
 *
 * **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9**
 */
export function mapErrorCodeToMessage(
  errorCode: ApiErrorCode | string,
  serverMessage?: string,
): string {
  switch (errorCode as ApiErrorCode) {
    case 'NOT_FOUND':
      return serverMessage || 'Không tìm thấy';

    case 'UNAUTHORIZED':
      return 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại';

    case 'FORBIDDEN':
      return 'Bạn không có quyền thực hiện thao tác này';

    case 'GARAGE_CONTEXT_REQUIRED':
      return 'Vui lòng chọn gara trước khi thực hiện thao tác này';

    case 'VALIDATION_ERROR':
      return serverMessage || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại';

    case 'CONFLICT':
      return serverMessage || 'Dữ liệu đã tồn tại. Vui lòng kiểm tra lại';

    case 'INTERNAL_ERROR':
      return 'Lỗi hệ thống. Vui lòng thử lại sau';

    case 'BAD_REQUEST':
      return serverMessage || 'Yêu cầu không hợp lệ';

    default:
      // Unknown error code — use server message or generic fallback
      return serverMessage || 'Có lỗi xảy ra. Vui lòng thử lại';
  }
}

/**
 * Get user-friendly error message in Vietnamese.
 *
 * Priority chain:
 *   1. error.data.error_code  → mapErrorCodeToMessage (highest priority)
 *   2. HTTP status code       → specific Vietnamese messages
 *   3. error.data.message     → server-provided message
 *   4. error.message          → JS error message
 *   5. default fallback       → "Có lỗi xảy ra. Vui lòng thử lại"
 *
 * @param error - The API error object
 * @returns Vietnamese error message
 *
 * **Validates: Requirements 1.1, 1.10, 1.11**
 */
export function getErrorMessage(error: ApiError): string {
  // 0. Check network connectivity first (before any other checks)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'Không thể kết nối. Vui lòng kiểm tra mạng';
  }

  // 1. Highest priority: error_code from response data
  const errorCode = error.data?.error_code;
  if (errorCode) {
    const serverMessage = error.data?.message;
    return mapErrorCodeToMessage(errorCode, serverMessage);
  }

  // 2. Fallback: HTTP status code
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
      break;
  }

  // 3. Fallback: server-provided message fields
  if (error.data?.error) {
    return error.data.error;
  }
  if (error.data?.message) {
    return error.data.message;
  }

  // 4. Fallback: JS error message
  if (error.message) {
    return error.message;
  }

  // 5. Generic default
  return 'Có lỗi xảy ra. Vui lòng thử lại';
}

/**
 * Handle API errors with fallback to cached data.
 *
 * Returns an object with:
 * - `message`: user-facing Vietnamese error message
 * - `shouldLogout`: true when error_code is UNAUTHORIZED or HTTP status is 401
 * - `data`: cached data if provided, otherwise null
 *
 * @param error - The API error object
 * @param cachedData - Optional cached data to use as fallback
 * @returns HandleApiErrorResult
 *
 * **Validates: Requirements 1.3, 5.2, 5.3, 5.4, 5.5**
 */
export function handleApiError(error: ApiError, cachedData?: any): HandleApiErrorResult {
  // Log error for debugging
  console.error('[ErrorHandler] API Error:', error);

  const errorCode = error.data?.error_code;
  const shouldLogout = errorCode === 'UNAUTHORIZED' || error.status === 401;

  // Get user-friendly error message
  const message = getErrorMessage(error);

  // For UNAUTHORIZED / 401, signal logout without showing alert
  if (shouldLogout) {
    return { message, shouldLogout: true, data: null };
  }

  // If cached data is available, show warning and return cached data
  if (cachedData) {
    Alert.alert(
      'Cảnh báo',
      `${message}\n\nHiển thị dữ liệu đã lưu.`,
      [{ text: 'OK' }],
    );
    return { message, shouldLogout: false, data: cachedData };
  }

  // No cached data, show error message
  Alert.alert('Lỗi', message, [{ text: 'OK' }]);

  return { message, shouldLogout: false, data: null };
}
