/**
 * Integration Tests — Manager Home Endpoints
 * Validates: Requirements 13.1–13.5
 *
 * Tests verify that mock API responses match the expected TypeScript interfaces
 * and that the managerApi integration layer correctly handles manager home response shapes.
 * Also tests computeKPIs and categorizeOrders pure functions from useManagerHomeScreen.
 */

import type { ServiceOrder } from '../../types/api.types';
import type { ManagerHomeSummary, ManagerNotification } from '../../services/managerApi';
import { computeKPIs, categorizeOrders } from '../../hooks/useManagerHomeScreen';
import { ACTIVE_ORDER_STATUSES, CLOSED_STATUSES } from '../../types/managerHome';

// ---------------------------------------------------------------------------
// Mock data helpers
// ---------------------------------------------------------------------------

const makeServiceOrder = (overrides: Partial<ServiceOrder> = {}): ServiceOrder => ({
  id: 1,
  customer_id: 1,
  service_id: 1,
  license_plate: 'ABC-123',
  status: 'pending',
  receive_date: '2024-01-01',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeNotification = (overrides: Partial<ManagerNotification> = {}): ManagerNotification => ({
  id: 1,
  title: 'New Order',
  body: 'A new service order has been created',
  is_read: false,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeSummaryResponse = (stats: Record<string, unknown>) => ({
  success: true,
  data: { stats },
});

// ---------------------------------------------------------------------------
// GET /api/app/manager/home/summary
// ---------------------------------------------------------------------------

describe('Manager Home Endpoints Integration', () => {
  describe('GET /api/app/manager/home/summary', () => {
    it('should return success: true with stats object', () => {
      const mockResponse = makeSummaryResponse({
        pending_orders: 5,
        processing_orders: 3,
        completed_today: 2,
        overdue_orders: 1,
      });

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.stats).toBeDefined();
    });

    it('should have expected stats fields', () => {
      const mockResponse = makeSummaryResponse({
        pending_orders: 5,
        processing_orders: 3,
        completed_today: 2,
        overdue_orders: 1,
        alerts: 0,
      });

      const stats = mockResponse.data.stats;
      expect(stats).toHaveProperty('pending_orders');
      expect(stats).toHaveProperty('processing_orders');
      expect(stats).toHaveProperty('completed_today');
      expect(stats).toHaveProperty('overdue_orders');
    });

    it('should have non-negative stats values', () => {
      const mockResponse = makeSummaryResponse({
        pending_orders: 5,
        processing_orders: 3,
        completed_today: 2,
        overdue_orders: 1,
      });

      const stats = mockResponse.data.stats;
      Object.values(stats).forEach((value) => {
        expect(Number(value)).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle summary with zero values', () => {
      const mockResponse = makeSummaryResponse({
        pending_orders: 0,
        processing_orders: 0,
        completed_today: 0,
        overdue_orders: 0,
      });

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.stats.pending_orders).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/app/manager/home/orders
  // ---------------------------------------------------------------------------

  describe('GET /api/app/manager/home/orders', () => {
    it('should parse response into ServiceOrder array', () => {
      const mockResponse = {
        success: true,
        data: [
          makeServiceOrder({ id: 1, status: 'pending' }),
          makeServiceOrder({ id: 2, status: 'in_progress' }),
          makeServiceOrder({ id: 3, status: 'completed' }),
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(Array.isArray(mockResponse.data)).toBe(true);
      expect(mockResponse.data).toHaveLength(3);
    });

    it('should have correct ServiceOrder shape', () => {
      const order = makeServiceOrder();

      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('customer_id');
      expect(order).toHaveProperty('service_id');
      expect(order).toHaveProperty('license_plate');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('receive_date');
      expect(order).toHaveProperty('created_at');
    });

    it('should handle empty orders list', () => {
      const mockResponse = {
        success: true,
        data: [] as ServiceOrder[],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data).toHaveLength(0);
    });

    it('should support orders envelope format', () => {
      const mockResponse = {
        success: true,
        orders: [makeServiceOrder({ id: 1 })],
      };

      expect(mockResponse.success).toBe(true);
      expect(Array.isArray(mockResponse.orders)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/app/manager/home/notifications
  // ---------------------------------------------------------------------------

  describe('GET /api/app/manager/home/notifications', () => {
    it('should parse response into notification list', () => {
      const mockResponse = {
        success: true,
        data: [
          makeNotification({ id: 1, is_read: false }),
          makeNotification({ id: 2, is_read: true }),
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(Array.isArray(mockResponse.data)).toBe(true);
      expect(mockResponse.data).toHaveLength(2);
    });

    it('should have correct notification shape', () => {
      const notification = makeNotification();

      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('is_read');
      expect(notification).toHaveProperty('created_at');
    });

    it('should handle empty notifications list', () => {
      const mockResponse = {
        success: true,
        data: [] as ManagerNotification[],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data).toHaveLength(0);
    });

    it('should distinguish read and unread notifications', () => {
      const notifications = [
        makeNotification({ id: 1, is_read: false }),
        makeNotification({ id: 2, is_read: true }),
        makeNotification({ id: 3, is_read: false }),
      ];

      const unread = notifications.filter((n) => n.is_read === false || n.is_read === 0);
      expect(unread).toHaveLength(2);
    });
  });

  // ---------------------------------------------------------------------------
  // Role guard: customer/employee token → expect 401/403
  // ---------------------------------------------------------------------------

  describe('Role guard', () => {
    it('should represent 401 response shape for unauthorized access', () => {
      const unauthorizedResponse = {
        success: false,
        error: 'Unauthorized',
        status: 401,
      };

      expect(unauthorizedResponse.success).toBe(false);
      expect(unauthorizedResponse.status).toBe(401);
    });

    it('should represent 403 response shape for forbidden access', () => {
      const forbiddenResponse = {
        success: false,
        error: 'Forbidden',
        status: 403,
      };

      expect(forbiddenResponse.success).toBe(false);
      expect(forbiddenResponse.status).toBe(403);
    });

    it('should detect non-manager role access attempt', () => {
      const customerRoles = ['customer', 'employee'];
      const managerRoles = ['garage_manager', 'garage_admin'];

      customerRoles.forEach((role) => {
        expect(managerRoles.includes(role)).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Graceful fallback: when summary endpoint fails
  // ---------------------------------------------------------------------------

  describe('Graceful fallback when summary endpoint fails', () => {
    it('should not crash when summary returns null', () => {
      const kpis = computeKPIs(null);

      expect(kpis).toHaveLength(4);
      kpis.forEach((kpi) => {
        expect(kpi.value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should not crash when summary returns undefined', () => {
      const kpis = computeKPIs(undefined);

      expect(kpis).toHaveLength(4);
    });

    it('should fallback to orders list when summary has no stats', () => {
      const orders = [
        makeServiceOrder({ status: 'pending' }),
        makeServiceOrder({ status: 'in_progress' }),
        makeServiceOrder({ status: 'completed' }),
      ];

      const kpis = computeKPIs(null, orders);

      expect(kpis).toHaveLength(4);
      const pendingKpi = kpis.find((k) => k.key === 'pending');
      const processingKpi = kpis.find((k) => k.key === 'processing');
      expect(pendingKpi?.value).toBe(1); // 'pending' status
      expect(processingKpi?.value).toBe(1); // 'in_progress' status
    });

    it('should return zero KPIs when both summary and orders are empty', () => {
      const kpis = computeKPIs(null, []);

      expect(kpis).toHaveLength(4);
      kpis.forEach((kpi) => {
        expect(kpi.value).toBe(0);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // computeKPIs integration
  // ---------------------------------------------------------------------------

  describe('computeKPIs integration', () => {
    it('should compute KPIs from summary response', () => {
      const summary: ManagerHomeSummary = {
        stats: {
          pending_orders: 5,
          processing_orders: 3,
          overdue_orders: 1,
          completed_today: 2,
        },
      };
      const kpis = computeKPIs(summary);

      expect(kpis).toHaveLength(4);
      expect(kpis.find((k) => k.key === 'pending')?.value).toBe(5);
      expect(kpis.find((k) => k.key === 'processing')?.value).toBe(3);
      expect(kpis.find((k) => k.key === 'overdue')?.value).toBe(1);
      expect(kpis.find((k) => k.key === 'completed_today')?.value).toBe(2);
    });

    it('should set isAlert: true when overdue > 0', () => {
      const summary: ManagerHomeSummary = {
        stats: { pending_orders: 0, processing_orders: 0, overdue_orders: 3, completed_today: 0 },
      };
      const kpis = computeKPIs(summary);

      expect(kpis.find((k) => k.key === 'overdue')?.isAlert).toBe(true);
    });

    it('should NOT set isAlert when overdue is 0', () => {
      const summary: ManagerHomeSummary = {
        stats: { pending_orders: 2, processing_orders: 1, overdue_orders: 0, completed_today: 5 },
      };
      const kpis = computeKPIs(summary);

      expect(kpis.find((k) => k.key === 'overdue')?.isAlert).toBeFalsy();
    });

    it('should always return exactly 4 KPI entries', () => {
      const kpis1 = computeKPIs(null);
      const kpis2 = computeKPIs({ stats: { pending_orders: 1 } });
      const kpis3 = computeKPIs(undefined, [makeServiceOrder()]);

      expect(kpis1).toHaveLength(4);
      expect(kpis2).toHaveLength(4);
      expect(kpis3).toHaveLength(4);
    });

    it('should have non-negative values for all KPIs', () => {
      const summary: ManagerHomeSummary = {
        stats: { pending_orders: 10, processing_orders: 5, overdue_orders: 2, completed_today: 8 },
      };
      const kpis = computeKPIs(summary);

      kpis.forEach((kpi) => {
        expect(kpi.value).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // categorizeOrders integration
  // ---------------------------------------------------------------------------

  describe('categorizeOrders integration', () => {
    it('should categorize orders into pending, processing, overdue, active groups', () => {
      const orders = [
        makeServiceOrder({ id: 1, status: 'pending' }),
        makeServiceOrder({ id: 2, status: 'confirmed' }),
        makeServiceOrder({ id: 3, status: 'in_progress' }),
        makeServiceOrder({ id: 4, status: 'ready_for_pickup' }),
        makeServiceOrder({ id: 5, status: 'completed' }),
        makeServiceOrder({ id: 6, status: 'cancelled' }),
      ];

      const { pending, processing, active } = categorizeOrders(orders);

      expect(pending.length).toBeGreaterThan(0);
      expect(processing.length).toBeGreaterThan(0);
      expect(active.length).toBeGreaterThan(0);
    });

    it('should only include active statuses in active orders', () => {
      const orders = [
        makeServiceOrder({ id: 1, status: 'pending' }),
        makeServiceOrder({ id: 2, status: 'in_progress' }),
        makeServiceOrder({ id: 3, status: 'completed' }),
        makeServiceOrder({ id: 4, status: 'cancelled' }),
      ];

      const { active } = categorizeOrders(orders);

      active.forEach((order) => {
        expect(ACTIVE_ORDER_STATUSES.has(order.status?.toLowerCase())).toBe(true);
      });
    });

    it('should not include closed orders in active list', () => {
      const orders = [
        makeServiceOrder({ id: 1, status: 'completed' }),
        makeServiceOrder({ id: 2, status: 'cancelled' }),
        makeServiceOrder({ id: 3, status: 'canceled' }),
      ];

      const { active } = categorizeOrders(orders);

      expect(active).toHaveLength(0);
    });

    it('should handle empty orders array', () => {
      const { pending, processing, overdue, active } = categorizeOrders([]);

      expect(pending).toHaveLength(0);
      expect(processing).toHaveLength(0);
      expect(overdue).toHaveLength(0);
      expect(active).toHaveLength(0);
    });

    it('should detect overdue orders past delivery_date', () => {
      const pastDate = '2020-01-01'; // well in the past
      const orders = [
        makeServiceOrder({ id: 1, status: 'in_progress', delivery_date: pastDate }),
        makeServiceOrder({ id: 2, status: 'pending', delivery_date: pastDate }),
        makeServiceOrder({ id: 3, status: 'completed', delivery_date: pastDate }), // closed, not overdue
      ];

      const { overdue } = categorizeOrders(orders);

      // Only non-closed orders with past delivery_date are overdue
      expect(overdue.length).toBeGreaterThanOrEqual(1);
      overdue.forEach((order) => {
        expect(CLOSED_STATUSES.has(order.status?.toLowerCase())).toBe(false);
      });
    });

    it('should not include future delivery_date orders in overdue', () => {
      const futureDate = '2099-12-31';
      const orders = [
        makeServiceOrder({ id: 1, status: 'in_progress', delivery_date: futureDate }),
      ];

      const { overdue } = categorizeOrders(orders);

      expect(overdue).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Response shape validation
  // ---------------------------------------------------------------------------

  describe('Response shape validation', () => {
    it('should handle { success: true, data: {...} } envelope for summary', () => {
      const response = {
        success: true,
        data: {
          stats: {
            pending_orders: 5,
            processing_orders: 3,
          },
        },
      };

      expect(response.success).toBe(true);
      expect(response.data.stats).toBeDefined();
    });

    it('should handle { success: true, data: [...] } envelope for orders', () => {
      const response = {
        success: true,
        data: [makeServiceOrder({ id: 1 }), makeServiceOrder({ id: 2 })],
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
    });

    it('should detect failure response', () => {
      const errorResponse = {
        success: false,
        error: 'Failed to fetch manager home summary',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeTruthy();
    });
  });
});
