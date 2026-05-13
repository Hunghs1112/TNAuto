// src/utils/__tests__/errorHandler.test.ts
import { Alert } from 'react-native';
import {
  handleApiError,
  getErrorMessage,
  mapErrorCodeToMessage,
  ApiError,
} from '../errorHandler';
import { ApiErrorCode } from '../../types/api.types';
import * as fc from 'fast-check';

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

const ALL_ERROR_CODES: ApiErrorCode[] = [
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'VALIDATION_ERROR',
  'INTERNAL_ERROR',
  'GARAGE_CONTEXT_REQUIRED',
];

// ============================================================
// Sub-task 2.6: Unit tests for each error_code mapping
// ============================================================

describe('mapErrorCodeToMessage', () => {
  // Requirements 1.2
  it('NOT_FOUND returns default message when no server message', () => {
    expect(mapErrorCodeToMessage('NOT_FOUND')).toBe('Không tìm thấy');
  });

  it('NOT_FOUND returns server message when provided', () => {
    expect(mapErrorCodeToMessage('NOT_FOUND', 'Xe không tồn tại')).toBe('Xe không tồn tại');
  });

  // Requirements 1.3
  it('UNAUTHORIZED returns fixed message regardless of server message', () => {
    expect(mapErrorCodeToMessage('UNAUTHORIZED')).toBe(
      'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
    );
    expect(mapErrorCodeToMessage('UNAUTHORIZED', 'some server msg')).toBe(
      'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
    );
  });

  // Requirements 1.4
  it('FORBIDDEN returns fixed message', () => {
    expect(mapErrorCodeToMessage('FORBIDDEN')).toBe(
      'Bạn không có quyền thực hiện thao tác này',
    );
  });

  // Requirements 1.5
  it('GARAGE_CONTEXT_REQUIRED returns fixed message', () => {
    expect(mapErrorCodeToMessage('GARAGE_CONTEXT_REQUIRED')).toBe(
      'Vui lòng chọn gara trước khi thực hiện thao tác này',
    );
  });

  // Requirements 1.6
  it('VALIDATION_ERROR returns server message when provided', () => {
    expect(mapErrorCodeToMessage('VALIDATION_ERROR', 'Số điện thoại không hợp lệ')).toBe(
      'Số điện thoại không hợp lệ',
    );
  });

  it('VALIDATION_ERROR returns default message when no server message', () => {
    expect(mapErrorCodeToMessage('VALIDATION_ERROR')).toBe(
      'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại',
    );
  });

  // Requirements 1.7
  it('CONFLICT returns server message when provided', () => {
    expect(mapErrorCodeToMessage('CONFLICT', 'Biển số xe đã tồn tại')).toBe(
      'Biển số xe đã tồn tại',
    );
  });

  it('CONFLICT returns default message when no server message', () => {
    expect(mapErrorCodeToMessage('CONFLICT')).toBe(
      'Dữ liệu đã tồn tại. Vui lòng kiểm tra lại',
    );
  });

  // Requirements 1.8
  it('INTERNAL_ERROR returns fixed message', () => {
    expect(mapErrorCodeToMessage('INTERNAL_ERROR')).toBe(
      'Lỗi hệ thống. Vui lòng thử lại sau',
    );
  });

  // Requirements 1.9
  it('BAD_REQUEST returns server message when provided', () => {
    expect(mapErrorCodeToMessage('BAD_REQUEST', 'Thiếu trường bắt buộc')).toBe(
      'Thiếu trường bắt buộc',
    );
  });

  it('BAD_REQUEST returns default message when no server message', () => {
    expect(mapErrorCodeToMessage('BAD_REQUEST')).toBe('Yêu cầu không hợp lệ');
  });

  // Requirements 1.10 — unknown code
  it('unknown error code returns server message when provided', () => {
    expect(mapErrorCodeToMessage('SOME_UNKNOWN_CODE', 'Server says something')).toBe(
      'Server says something',
    );
  });

  it('unknown error code returns generic fallback when no server message', () => {
    expect(mapErrorCodeToMessage('SOME_UNKNOWN_CODE')).toBe(
      'Có lỗi xảy ra. Vui lòng thử lại',
    );
  });
});

// ============================================================
// getErrorMessage — existing + updated tests
// ============================================================

describe('getErrorMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.navigator as any).onLine = true;
  });

  it('should return network error message when offline', () => {
    (global.navigator as any).onLine = false;
    const error: ApiError = {};

    const message = getErrorMessage(error);

    expect(message).toBe('Không thể kết nối. Vui lòng kiểm tra mạng');
  });

  it('should return 401 error message (no error_code)', () => {
    const error: ApiError = { status: 401 };

    const message = getErrorMessage(error);

    expect(message).toBe('Phiên đăng nhập hết hạn');
  });

  it('should return 404 error message (no error_code)', () => {
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

  it('should extract error message from data.error (no error_code)', () => {
    const error: ApiError = {
      status: 400,
      data: { error: 'Custom error message' },
    };

    const message = getErrorMessage(error);

    expect(message).toBe('Custom error message');
  });

  it('should extract error message from data.message (no error_code)', () => {
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

    expect(message).toBe('Có lỗi xảy ra. Vui lòng thử lại');
  });

  // error_code takes priority over HTTP status
  it('should use error_code message even when HTTP status is 404', () => {
    const error: ApiError = {
      status: 404,
      data: { error_code: 'FORBIDDEN' },
    };

    const message = getErrorMessage(error);

    expect(message).toBe('Bạn không có quyền thực hiện thao tác này');
  });

  it('should use error_code message even when HTTP status is 401', () => {
    const error: ApiError = {
      status: 401,
      data: { error_code: 'GARAGE_CONTEXT_REQUIRED' },
    };

    const message = getErrorMessage(error);

    expect(message).toBe('Vui lòng chọn gara trước khi thực hiện thao tác này');
  });
});

// ============================================================
// handleApiError — updated tests for new return type
// ============================================================

describe('handleApiError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.navigator as any).onLine = true;
  });

  it('should return shouldLogout=true for 401 errors without showing alert', () => {
    const error: ApiError = { status: 401 };

    const result = handleApiError(error);

    expect(result.shouldLogout).toBe(true);
    expect(result.data).toBeNull();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('should return shouldLogout=true for UNAUTHORIZED error_code', () => {
    const error: ApiError = {
      status: 401,
      data: { error_code: 'UNAUTHORIZED' },
    };

    const result = handleApiError(error);

    expect(result.shouldLogout).toBe(true);
    expect(result.message).toBe('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('should return shouldLogout=true for UNAUTHORIZED error_code even without 401 status', () => {
    const error: ApiError = {
      status: 403,
      data: { error_code: 'UNAUTHORIZED' },
    };

    const result = handleApiError(error);

    expect(result.shouldLogout).toBe(true);
  });

  it('should return cached data and show warning alert when cached data is available', () => {
    const error: ApiError = { status: 500 };
    const cachedData = { id: 1, name: 'Test' };

    const result = handleApiError(error, cachedData);

    expect(result.data).toBe(cachedData);
    expect(result.shouldLogout).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Cảnh báo',
      expect.stringContaining('Lỗi hệ thống'),
      [{ text: 'OK' }],
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Cảnh báo',
      expect.stringContaining('Hiển thị dữ liệu đã lưu'),
      [{ text: 'OK' }],
    );
  });

  it('should return null data and show error alert when no cached data', () => {
    const error: ApiError = { status: 500 };

    const result = handleApiError(error);

    expect(result.data).toBeNull();
    expect(result.shouldLogout).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Lỗi',
      'Lỗi hệ thống. Vui lòng thử lại sau',
      [{ text: 'OK' }],
    );
  });

  it('should handle network errors with cached data', () => {
    (global.navigator as any).onLine = false;
    const error: ApiError = {};
    const cachedData = { orders: [] };

    const result = handleApiError(error, cachedData);

    expect(result.data).toBe(cachedData);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Cảnh báo',
      expect.stringContaining('Không thể kết nối'),
      [{ text: 'OK' }],
    );
  });

  it('should handle network errors without cached data', () => {
    (global.navigator as any).onLine = false;
    const error: ApiError = {};

    const result = handleApiError(error);

    expect(result.data).toBeNull();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Lỗi',
      'Không thể kết nối. Vui lòng kiểm tra mạng',
      [{ text: 'OK' }],
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

// ============================================================
// Sub-task 2.4: Property 1 — error_code takes priority over HTTP status
// Feature: backend-api-migration, Property 1
// Validates: Requirements 1.11
// ============================================================

describe('Property 1: error_code takes priority over HTTP status', () => {
  it('getErrorMessage uses error_code mapping regardless of HTTP status', () => {
    // Feature: backend-api-migration, Property 1: error_code takes priority over HTTP status
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_ERROR_CODES),
        fc.integer({ min: 400, max: 599 }),
        (errorCode, httpStatus) => {
          const error: ApiError = {
            status: httpStatus,
            data: { error_code: errorCode },
          };
          const msg = getErrorMessage(error);
          const expectedMsg = mapErrorCodeToMessage(errorCode, undefined);
          return msg === expectedMsg;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ============================================================
// Sub-task 2.5: Property 2 — unknown error codes fall back gracefully
// Feature: backend-api-migration, Property 2
// Validates: Requirements 1.10
// ============================================================

describe('Property 2: Unknown error codes fall back gracefully', () => {
  it('getErrorMessage never throws and never returns empty string for unknown error_code', () => {
    // Feature: backend-api-migration, Property 2: unknown error codes fall back gracefully
    fc.assert(
      fc.property(
        fc.string().filter(s => !(ALL_ERROR_CODES as string[]).includes(s)),
        fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
        (unknownCode, serverMessage) => {
          const error: ApiError = {
            data: {
              error_code: unknownCode as ApiErrorCode,
              message: serverMessage,
            },
          };
          let msg: string;
          try {
            msg = getErrorMessage(error);
          } catch {
            return false; // must not throw
          }
          return typeof msg === 'string' && msg.length > 0;
        },
      ),
      { numRuns: 100 },
    );
  });
});
