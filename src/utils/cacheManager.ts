// src/utils/cacheManager.ts
// Cache management utilities for RTK Query cache

/**
 * Cache metadata structure from RTK Query
 */
export interface CacheMetadata {
  timestamp: number;
  expiresAt: number;
}

/**
 * RTK Query cache entry structure
 */
interface QueryCacheEntry<T = unknown> {
  status: 'fulfilled' | 'pending' | 'rejected';
  data?: T;
  error?: unknown;
  fulfilledTimeStamp?: number;
  requestId?: string;
}

/**
 * Cache time-to-live: 24 hours in milliseconds
 */
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Kiểm tra xem cache có còn hợp lệ hay không
 * Cache được coi là hợp lệ nếu chưa quá thời gian expiresAt
 * 
 * @param metadata - Metadata của cache chứa timestamp và expiresAt
 * @returns true nếu cache còn hợp lệ, false nếu đã hết hạn
 * 
 * @example
 * const metadata = { timestamp: Date.now(), expiresAt: Date.now() + 3600000 };
 * isCacheValid(metadata); // true (cache còn 1 giờ)
 */
export function isCacheValid(metadata: CacheMetadata): boolean {
  return Date.now() < metadata.expiresAt;
}

/**
 * Lấy tuổi của cache dưới dạng chuỗi tiếng Việt dễ đọc
 * 
 * @param metadata - Metadata của cache chứa timestamp
 * @returns Chuỗi mô tả thời gian cache (ví dụ: "5 phút trước", "2 giờ trước", "3 ngày trước")
 * 
 * @example
 * const metadata = { timestamp: Date.now() - 300000, expiresAt: Date.now() };
 * getCacheAge(metadata); // "5 phút trước"
 */
export function getCacheAge(metadata: CacheMetadata): string {
  const ageMs = Date.now() - metadata.timestamp;
  const ageMinutes = Math.floor(ageMs / 60000);
  
  if (ageMinutes < 1) {
    return 'vừa xong';
  }
  
  if (ageMinutes < 60) {
    return `${ageMinutes} phút trước`;
  }
  
  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) {
    return `${ageHours} giờ trước`;
  }
  
  const ageDays = Math.floor(ageHours / 24);
  return `${ageDays} ngày trước`;
}

/**
 * Lấy dữ liệu đã cache từ Redux store theo query key
 * Hàm này truy xuất dữ liệu từ RTK Query cache state
 * 
 * @param queryKey - Key của query trong RTK Query cache (ví dụ: 'getManagerHomeSummary(undefined)')
 * @returns Object chứa data, metadata, và trạng thái cache, hoặc null nếu không tìm thấy
 * 
 * @example
 * const cached = getCachedData('getManagerHomeSummary(undefined)');
 * if (cached && isCacheValid(cached.metadata)) {
 *   console.log('Using cached data:', cached.data);
 * }
 */
export function getCachedData<T = unknown>(
  queryKey: string
): {
  data: T;
  metadata: CacheMetadata;
  isValid: boolean;
} | null {
  // Note: This function requires access to Redux store
  // In actual usage, it should be called with store.getState()
  // or used within a Redux selector/hook
  
  // This is a utility function that can be used with store state
  // Example usage in a selector:
  // const state = store.getState();
  // const apiState = state.managerApi;
  // const queries = apiState?.queries || {};
  // const cacheEntry = queries[queryKey];
  
  // For now, return null as this needs to be integrated with actual Redux state
  // The implementation will be completed when used in actual components/hooks
  return null;
}

/**
 * Tạo metadata cho cache mới
 * 
 * @param timestamp - Thời điểm tạo cache (mặc định là hiện tại)
 * @returns CacheMetadata object với timestamp và expiresAt
 */
export function createCacheMetadata(timestamp: number = Date.now()): CacheMetadata {
  return {
    timestamp,
    expiresAt: timestamp + CACHE_TTL,
  };
}

/**
 * Kiểm tra xem cache có tồn tại và hợp lệ không
 * 
 * @param cachedData - Dữ liệu cache trả về từ getCachedData
 * @returns true nếu cache tồn tại và còn hợp lệ
 */
export function hasFreshCache<T>(
  cachedData: ReturnType<typeof getCachedData<T>>
): boolean {
  return cachedData !== null && cachedData !== undefined && cachedData.isValid;
}
