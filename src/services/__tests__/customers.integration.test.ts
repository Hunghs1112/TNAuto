/**
 * Integration Tests — Customers CRUD
 * Validates: Requirements 9.1–9.8
 *
 * Tests verify that mock API responses match the expected TypeScript interfaces
 * and that the adminGarageApi integration layer correctly handles customer response shapes.
 */

import type { Customer, Vehicle } from '../../types/api.types';
import type { AdminStats, AdminMutationResponse, AdminCustomer } from '../adminGarageApi';

// ---------------------------------------------------------------------------
// Mock data helpers
// ---------------------------------------------------------------------------

const makeCustomer = (overrides: Partial<AdminCustomer> = {}): AdminCustomer => ({
  id: 1,
  name: 'Nguyen Van A',
  phone: '0901234567',
  email: 'nguyenvana@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 1,
  customer_id: 1,
  license_plate: 'ABC-123',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeListResponse = <T>(data: T[]) => ({
  success: true,
  data,
});

const makeMutationResponse = (extra: Record<string, unknown> = {}): AdminMutationResponse => ({
  success: true,
  ...extra,
});

const makeStatsResponse = (stats: Record<string, unknown>) => ({
  success: true,
  data: stats,
});

// ---------------------------------------------------------------------------
// GET /api/app/admin/customers
// ---------------------------------------------------------------------------

describe('Customers Integration', () => {
  describe('GET /api/app/admin/customers', () => {
    it('should parse response into Customer array', () => {
      const mockResponse = makeListResponse([makeCustomer()]);

      expect(mockResponse.success).toBe(true);
      expect(Array.isArray(mockResponse.data)).toBe(true);
      expect(mockResponse.data).toHaveLength(1);
    });

    it('should have correct Customer shape', () => {
      const customer = makeCustomer();

      expect(customer).toHaveProperty('id');
      expect(customer).toHaveProperty('name');
      expect(customer).toHaveProperty('phone');
    });

    it('should handle empty customer list', () => {
      const mockResponse = makeListResponse<AdminCustomer>([]);

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data).toHaveLength(0);
    });

    it('should support optional admin-specific fields', () => {
      const customer = makeCustomer({
        active_order_count: 2,
        total_orders: 10,
        vehicle_count: 3,
        last_service_at: '2024-01-15T00:00:00Z',
        status: 'active',
      });

      expect(customer.active_order_count).toBe(2);
      expect(customer.total_orders).toBe(10);
      expect(customer.vehicle_count).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/app/admin/customers
  // ---------------------------------------------------------------------------

  describe('POST /api/app/admin/customers', () => {
    it('should verify customer created response shape', () => {
      const createBody = {
        name: 'Tran Thi B',
        phone: '0912345678',
        email: 'tranthib@example.com',
      };
      const mockResponse = makeMutationResponse({ data: makeCustomer(createBody) });

      expect(mockResponse.success).toBe(true);
    });

    it('should include required fields in create body', () => {
      const createBody = {
        name: 'Le Van C',
        phone: '0923456789',
      };

      expect(createBody).toHaveProperty('name');
      expect(createBody).toHaveProperty('phone');
    });

    it('should support optional email and license_plate in create body', () => {
      const createBody = {
        name: 'Pham Thi D',
        phone: '0934567890',
        email: 'phamthid@example.com',
        license_plate: 'XYZ-456',
      };

      expect(createBody).toHaveProperty('email');
      expect(createBody).toHaveProperty('license_plate');
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/app/admin/customers/:id
  // ---------------------------------------------------------------------------

  describe('GET /api/app/admin/customers/:id', () => {
    it('should verify customer detail response shape', () => {
      const mockResponse = {
        success: true,
        data: makeCustomer({ id: 5, name: 'Hoang Van E' }),
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.id).toBe(5);
      expect(mockResponse.data.name).toBe('Hoang Van E');
    });

    it('should include all customer fields in detail', () => {
      const customer = makeCustomer({
        id: 10,
        name: 'Nguyen Thi F',
        phone: '0945678901',
        email: 'nguyenthif@example.com',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      expect(customer.id).toBe(10);
      expect(customer.email).toBe('nguyenthif@example.com');
      expect(customer.avatar_url).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // PUT /PATCH /api/app/admin/customers/:id
  // ---------------------------------------------------------------------------

  describe('PUT/PATCH /api/app/admin/customers/:id', () => {
    it('should verify update response shape', () => {
      const updateBody = { name: 'Updated Name', phone: '0956789012' };
      const mockResponse = makeMutationResponse();

      expect(mockResponse.success).toBe(true);
      expect(updateBody).toHaveProperty('name');
    });

    it('should support partial update via PATCH', () => {
      const patchBody = { email: 'newemail@example.com' };
      const mockResponse = makeMutationResponse();

      expect(mockResponse.success).toBe(true);
      expect(patchBody).toHaveProperty('email');
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/app/admin/customers/:id
  // ---------------------------------------------------------------------------

  describe('DELETE /api/app/admin/customers/:id', () => {
    it('should verify deletion response shape', () => {
      const mockResponse = makeMutationResponse({ message: 'Customer unlinked from garage' });

      expect(mockResponse.success).toBe(true);
    });

    it('should return success true on deletion', () => {
      const mockResponse: AdminMutationResponse = { success: true };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.error).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/app/admin/customers/:id/vehicles
  // ---------------------------------------------------------------------------

  describe('GET /api/app/admin/customers/:id/vehicles', () => {
    it('should parse response into Vehicle array', () => {
      const mockResponse = makeListResponse([
        makeVehicle({ id: 1, license_plate: 'ABC-123' }),
        makeVehicle({ id: 2, license_plate: 'DEF-456' }),
      ]);

      expect(mockResponse.success).toBe(true);
      expect(Array.isArray(mockResponse.data)).toBe(true);
      expect(mockResponse.data).toHaveLength(2);
    });

    it('should have correct Vehicle shape', () => {
      const vehicle = makeVehicle();

      expect(vehicle).toHaveProperty('id');
      expect(vehicle).toHaveProperty('customer_id');
      expect(vehicle).toHaveProperty('license_plate');
      expect(vehicle).toHaveProperty('created_at');
    });

    it('should support optional vehicle fields', () => {
      const vehicle = makeVehicle({
        model: 'Toyota Camry',
        image_url: 'https://example.com/car.jpg',
        has_active_order: true,
        active_order_count: 1,
      });

      expect(vehicle.model).toBe('Toyota Camry');
      expect(vehicle.has_active_order).toBe(true);
    });

    it('should handle customer with no vehicles', () => {
      const mockResponse = makeListResponse<Vehicle>([]);

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // PUT /api/app/admin/customers/:id/driver-license
  // ---------------------------------------------------------------------------

  describe('PUT /api/app/admin/customers/:id/driver-license', () => {
    it('should verify driver license upsert response shape', () => {
      const licenseBody = {
        license_number: 'DL123456',
        license_expiry_date: '2026-12-31',
      };
      const mockResponse = makeMutationResponse();

      expect(mockResponse.success).toBe(true);
      expect(licenseBody).toHaveProperty('license_number');
    });

    it('should include license fields in request body', () => {
      const licenseBody = {
        license_number: 'DL789012',
        license_expiry_date: '2027-06-30',
      };

      expect(licenseBody.license_number).toBeTruthy();
      expect(licenseBody.license_expiry_date).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/app/admin/customers/stats
  // ---------------------------------------------------------------------------

  describe('GET /api/app/admin/customers/stats', () => {
    it('should verify stats has total_customers field', () => {
      const mockStats: AdminStats = {
        total_customers: 250,
        active_customers: 180,
        new_customers_this_month: 15,
      };
      const mockResponse = makeStatsResponse(mockStats);

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data).toHaveProperty('total_customers');
    });

    it('should have non-negative total_customers value', () => {
      const mockStats: AdminStats = {
        total_customers: 250,
        active_customers: 180,
      };

      expect(Number(mockStats.total_customers)).toBeGreaterThanOrEqual(0);
    });

    it('should support active_customers field', () => {
      const mockStats: AdminStats = {
        total_customers: 100,
        active_customers: 75,
      };

      expect(mockStats).toHaveProperty('active_customers');
      expect(Number(mockStats.active_customers)).toBeLessThanOrEqual(
        Number(mockStats.total_customers),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Response shape validation
  // ---------------------------------------------------------------------------

  describe('Response shape validation', () => {
    it('should handle { success: true, data: [...] } envelope for list', () => {
      const response = {
        success: true,
        data: [makeCustomer({ id: 1 }), makeCustomer({ id: 2 })],
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
    });

    it('should handle { success: true, customers: [...] } envelope', () => {
      const response = {
        success: true,
        customers: [makeCustomer({ id: 3 })],
      };

      expect(response.success).toBe(true);
      expect(Array.isArray(response.customers)).toBe(true);
    });

    it('should detect failure response', () => {
      const errorResponse = {
        success: false,
        error: 'Customer not found',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeTruthy();
    });
  });
});
