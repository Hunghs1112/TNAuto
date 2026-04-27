// src/utils/__tests__/errorHandler.test.ts
import { Alert } from 'react-native';
import { handleApiError, getErrorMessage, ApiError } from '../errorHandler';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock navigator.onLine
Object.defineProperty(global.navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.navigator as any).onLine = true;
  });

  describe('getErrorMessage', () => {
    it('should return network error message when offline', () => {
      (global.navigator as any).onLine = false;
      const error: ApiError = {};
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Không thể kết nối. Vui lòng kiểm tra mạng');
    });

    it('should return 401 error message', () => {
      const error: ApiError = { status: 401 };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Phiên đăng nhập hết hạn');
    });

    it('should return 404 error message', () => {
      const error: ApiError = { status: 404 };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Không tìm thấy dữ liệu');
    });

    it('should return 408 timeout error message', () => {
      const error: ApiError = { status: 408 };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Yêu cầu quá lâu. Vui lòng thử lại');
    });

    it('should return 500 server error message', () => {
      const error: ApiError = { status: 500 };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Lỗi hệ thống. Vui lòng thử lại sau');
    });

    it('should return 502 server error message', () => {
      const error: ApiError = { status: 502 };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Lỗi hệ thống. Vui lòng thử lại sau');
    });

    it('should return 503 server error message', () => {
      const error: ApiError = { status: 503 };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Lỗi hệ thống. Vui lòng thử lại sau');
    });

    it('should extract error message from data.error', () => {
      const error: ApiError = {
        status: 400,
        data: { error: 'Custom error message' },
      };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Custom error message');
    });

    it('should extract error message from data.message', () => {
      const error: ApiError = {
        status: 400,
        data: { message: 'Custom message' },
      };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Custom message');
    });

    it('should extract error message from message property', () => {
      const error: ApiError = {
        status: 400,
        message: 'Error message',
      };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Error message');
    });

    it('should return generic error message as fallback', () => {
      const error: ApiError = { status: 400 };
      
      const message = getErrorMessage(error);
      
      expect(message).toBe('Đã xảy ra lỗi. Vui lòng thử lại');
    });
  });

  describe('handleApiError', () => {
    it('should return null for 401 errors without showing alert', () => {
      const error: ApiError = { status: 401 };
      
      const result = handleApiError(error);
      
      expect(result).toBeNull();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should return cached data and show warning alert when cached data is available', () => {
      const error: ApiError = { status: 500 };
      const cachedData = { id: 1, name: 'Test' };
      
      const result = handleApiError(error, cachedData);
      
      expect(result).toBe(cachedData);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Cảnh báo',
        expect.stringContaining('Lỗi hệ thống'),
        [{ text: 'OK' }]
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Cảnh báo',
        expect.stringContaining('Hiển thị dữ liệu đã lưu'),
        [{ text: 'OK' }]
      );
    });

    it('should return null and show error alert when no cached data', () => {
      const error: ApiError = { status: 500 };
      
      const result = handleApiError(error);
      
      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Lỗi',
        'Lỗi hệ thống. Vui lòng thử lại sau',
        [{ text: 'OK' }]
      );
    });

    it('should handle network errors with cached data', () => {
      (global.navigator as any).onLine = false;
      const error: ApiError = {};
      const cachedData = { orders: [] };
      
      const result = handleApiError(error, cachedData);
      
      expect(result).toBe(cachedData);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Cảnh báo',
        expect.stringContaining('Không thể kết nối'),
        [{ text: 'OK' }]
      );
    });

    it('should handle network errors without cached data', () => {
      (global.navigator as any).onLine = false;
      const error: ApiError = {};
      
      const result = handleApiError(error);
      
      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Lỗi',
        'Không thể kết nối. Vui lòng kiểm tra mạng',
        [{ text: 'OK' }]
      );
    });

    it('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error: ApiError = { status: 500 };
      
      handleApiError(error);
      
      expect(consoleSpy).toHaveBeenCalledWith('[ErrorHandler] API Error:', error);
      
      consoleSpy.mockRestore();
    });
  });
});
