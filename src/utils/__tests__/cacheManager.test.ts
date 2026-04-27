// src/utils/__tests__/cacheManager.test.ts
import {
  isCacheValid,
  getCacheAge,
  createCacheMetadata,
  hasFreshCache,
  CacheMetadata,
} from '../cacheManager';

describe('cacheManager utilities', () => {
  describe('isCacheValid', () => {
    it('should return true for fresh cache', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000, // 1 hour from now
      };
      expect(isCacheValid(metadata)).toBe(true);
    });

    it('should return false for expired cache', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 86400000, // 24 hours ago
        expiresAt: Date.now() - 1000, // 1 second ago
      };
      expect(isCacheValid(metadata)).toBe(false);
    });

    it('should return false for cache expiring exactly now', () => {
      const now = Date.now();
      const metadata: CacheMetadata = {
        timestamp: now - 86400000,
        expiresAt: now,
      };
      expect(isCacheValid(metadata)).toBe(false);
    });

    it('should return true for cache expiring in the future', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now(),
        expiresAt: Date.now() + 1, // 1ms from now
      };
      expect(isCacheValid(metadata)).toBe(true);
    });
  });

  describe('getCacheAge', () => {
    it('should return "vừa xong" for cache less than 1 minute old', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 30000, // 30 seconds ago
        expiresAt: Date.now() + 3600000,
      };
      expect(getCacheAge(metadata)).toBe('vừa xong');
    });

    it('should return minutes for cache less than 1 hour old', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 300000, // 5 minutes ago
        expiresAt: Date.now() + 3600000,
      };
      expect(getCacheAge(metadata)).toBe('5 phút trước');
    });

    it('should return hours for cache less than 24 hours old', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 7200000, // 2 hours ago
        expiresAt: Date.now() + 3600000,
      };
      expect(getCacheAge(metadata)).toBe('2 giờ trước');
    });

    it('should return days for cache 24 hours or older', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 259200000, // 3 days ago
        expiresAt: Date.now() - 1000,
      };
      expect(getCacheAge(metadata)).toBe('3 ngày trước');
    });

    it('should handle exactly 1 minute old cache', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 60000, // exactly 1 minute ago
        expiresAt: Date.now() + 3600000,
      };
      expect(getCacheAge(metadata)).toBe('1 phút trước');
    });

    it('should handle exactly 1 hour old cache', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 3600000, // exactly 1 hour ago
        expiresAt: Date.now() + 3600000,
      };
      expect(getCacheAge(metadata)).toBe('1 giờ trước');
    });

    it('should handle exactly 1 day old cache', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 86400000, // exactly 1 day ago
        expiresAt: Date.now() - 1000,
      };
      expect(getCacheAge(metadata)).toBe('1 ngày trước');
    });

    it('should floor fractional minutes', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 150000, // 2.5 minutes ago
        expiresAt: Date.now() + 3600000,
      };
      expect(getCacheAge(metadata)).toBe('2 phút trước');
    });

    it('should floor fractional hours', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 5400000, // 1.5 hours ago
        expiresAt: Date.now() + 3600000,
      };
      expect(getCacheAge(metadata)).toBe('1 giờ trước');
    });

    it('should floor fractional days', () => {
      const metadata: CacheMetadata = {
        timestamp: Date.now() - 129600000, // 1.5 days ago
        expiresAt: Date.now() - 1000,
      };
      expect(getCacheAge(metadata)).toBe('1 ngày trước');
    });
  });

  describe('createCacheMetadata', () => {
    it('should create metadata with current timestamp by default', () => {
      const before = Date.now();
      const metadata = createCacheMetadata();
      const after = Date.now();

      expect(metadata.timestamp).toBeGreaterThanOrEqual(before);
      expect(metadata.timestamp).toBeLessThanOrEqual(after);
    });

    it('should create metadata with 24 hour TTL', () => {
      const timestamp = Date.now();
      const metadata = createCacheMetadata(timestamp);
      const expectedExpiry = timestamp + 24 * 60 * 60 * 1000;

      expect(metadata.expiresAt).toBe(expectedExpiry);
    });

    it('should accept custom timestamp', () => {
      const customTimestamp = Date.now() - 3600000; // 1 hour ago
      const metadata = createCacheMetadata(customTimestamp);

      expect(metadata.timestamp).toBe(customTimestamp);
      expect(metadata.expiresAt).toBe(customTimestamp + 24 * 60 * 60 * 1000);
    });

    it('should create valid cache metadata', () => {
      const metadata = createCacheMetadata();
      expect(isCacheValid(metadata)).toBe(true);
    });
  });

  describe('hasFreshCache', () => {
    it('should return true for valid cached data', () => {
      const cachedData = {
        data: { test: 'data' },
        metadata: {
          timestamp: Date.now(),
          expiresAt: Date.now() + 3600000,
        },
        isValid: true,
      };

      expect(hasFreshCache(cachedData)).toBe(true);
    });

    it('should return false for expired cached data', () => {
      const cachedData = {
        data: { test: 'data' },
        metadata: {
          timestamp: Date.now() - 86400000,
          expiresAt: Date.now() - 1000,
        },
        isValid: false,
      };

      expect(hasFreshCache(cachedData)).toBe(false);
    });

    it('should return false for null cached data', () => {
      expect(hasFreshCache(null)).toBe(false);
    });

    it('should return false for undefined cached data', () => {
      expect(hasFreshCache(undefined as any)).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete cache lifecycle', () => {
      // Create new cache
      const metadata = createCacheMetadata();
      expect(isCacheValid(metadata)).toBe(true);
      expect(getCacheAge(metadata)).toBe('vừa xong');

      // Simulate cache aging
      const agedMetadata: CacheMetadata = {
        timestamp: Date.now() - 7200000, // 2 hours ago
        expiresAt: metadata.expiresAt,
      };
      expect(isCacheValid(agedMetadata)).toBe(true);
      expect(getCacheAge(agedMetadata)).toBe('2 giờ trước');

      // Simulate cache expiration
      const expiredMetadata: CacheMetadata = {
        timestamp: Date.now() - 86400000, // 24 hours ago
        expiresAt: Date.now() - 1000, // expired
      };
      expect(isCacheValid(expiredMetadata)).toBe(false);
      expect(getCacheAge(expiredMetadata)).toBe('1 ngày trước');
    });

    it('should work with hasFreshCache helper', () => {
      const freshCache = {
        data: { orders: [] },
        metadata: createCacheMetadata(),
        isValid: true,
      };
      expect(hasFreshCache(freshCache)).toBe(true);

      const staleCache = {
        data: { orders: [] },
        metadata: {
          timestamp: Date.now() - 86400000,
          expiresAt: Date.now() - 1000,
        },
        isValid: false,
      };
      expect(hasFreshCache(staleCache)).toBe(false);
    });
  });
});
