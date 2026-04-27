// src/types/__tests__/managerHome.test.ts
// Tests for managerHome types and constants

import {
  ManagerHomeSummary,
  ManagerNotification,
  GarageSummary,
  OrdersState,
  ManagerActions,
  KPI,
  PENDING_STATUSES,
  PROCESSING_STATUSES,
  CLOSED_STATUSES,
  CACHE_TTL,
} from '../managerHome';

describe('managerHome types and constants', () => {
  describe('Type definitions', () => {
    it('should allow valid ManagerHomeSummary objects', () => {
      const summary: ManagerHomeSummary = {
        stats: {
          pending_orders: 5,
          processing_orders: 3,
          completed_today: 10,
          overdue_orders: 2,
          alerts: 4,
        },
      };

      expect(summary.stats?.pending_orders).toBe(5);
    });

    it('should allow valid ManagerNotification objects', () => {
      const notification: ManagerNotification = {
        id: 1,
        title: 'Test Notification',
        body: 'Test body',
        is_read: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      expect(notification.id).toBe(1);
    });

    it('should allow valid GarageSummary objects', () => {
      const garage: GarageSummary = {
        name: 'Test Garage',
        code: 'TG001',
        address: '123 Test St',
        canChangeGarage: false,
      };

      expect(garage.name).toBe('Test Garage');
    });

    it('should allow valid KPI objects', () => {
      const kpi: KPI = {
        key: 'pending',
        label: 'Don cho xu ly',
        value: 5,
      };

      expect(kpi.value).toBe(5);
    });
  });

  describe('Order status constants', () => {
    it('should have correct pending statuses', () => {
      expect(PENDING_STATUSES.has('received')).toBe(true);
      expect(PENDING_STATUSES.has('pending')).toBe(true);
      expect(PENDING_STATUSES.has('confirmed')).toBe(true);
      expect(PENDING_STATUSES.size).toBe(3);
    });

    it('should have correct processing statuses', () => {
      expect(PROCESSING_STATUSES.has('in_progress')).toBe(true);
      expect(PROCESSING_STATUSES.has('processing')).toBe(true);
      expect(PROCESSING_STATUSES.has('ready_for_pickup')).toBe(true);
      expect(PROCESSING_STATUSES.size).toBe(3);
    });

    it('should have correct closed statuses', () => {
      expect(CLOSED_STATUSES.has('completed')).toBe(true);
      expect(CLOSED_STATUSES.has('cancelled')).toBe(true);
      expect(CLOSED_STATUSES.has('canceled')).toBe(true);
      expect(CLOSED_STATUSES.size).toBe(3);
    });

    it('should not overlap between status sets', () => {
      const allStatuses = [
        ...Array.from(PENDING_STATUSES),
        ...Array.from(PROCESSING_STATUSES),
        ...Array.from(CLOSED_STATUSES),
      ];

      const uniqueStatuses = new Set(allStatuses);
      expect(allStatuses.length).toBe(uniqueStatuses.size);
    });
  });

  describe('Cache constants', () => {
    it('should have correct CACHE_TTL value', () => {
      const expectedTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      expect(CACHE_TTL).toBe(expectedTTL);
      expect(CACHE_TTL).toBe(86400000);
    });
  });
});
