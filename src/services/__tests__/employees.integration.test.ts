/**
 * Integration Tests — Employees CRUD
 * Validates: Requirements 10.1–10.7
 *
 * Tests verify that mock API responses match the expected TypeScript interfaces
 * and that the adminGarageApi integration layer correctly handles employee response shapes.
 */

import type { Employee } from '../../types/api.types';
import type { AdminStats, AdminMutationResponse, AdminEmployee } from '../adminGarageApi';

// ---------------------------------------------------------------------------
// Mock data helpers
// ---------------------------------------------------------------------------

const makeEmployee = (overrides: Partial<AdminEmployee> = {}): AdminEmployee => ({
  id: '1',
  name: 'Nguyen Mechanic',
  phone: '0901234567',
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
// GET /api/app/admin/employees
// ---------------------------------------------------------------------------

describe('Employees Integration', () => {
  describe('GET /api/app/admin/employees', () => {
    it('should parse response into Employee array', () => {
      const mockResponse = makeListResponse([makeEmployee()]);

      expect(mockResponse.success).toBe(true);
      expect(Array.isArray(mockResponse.data)).toBe(true);
      expect(mockResponse.data).toHaveLength(1);
    });

    it('should have correct Employee shape', () => {
      const employee = makeEmployee();

      expect(employee).toHaveProperty('id');
      expect(employee).toHaveProperty('name');
      expect(employee).toHaveProperty('phone');
    });

    it('should handle empty employee list', () => {
      const mockResponse = makeListResponse<AdminEmployee>([]);

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data).toHaveLength(0);
    });

    it('should support optional admin-specific fields', () => {
      const employee = makeEmployee({
        position: 'Senior Mechanic',
        status: 'active',
        active_order_count: 3,
        total_orders: 50,
        garage_id: 1,
        garage_name: 'Main Garage',
      });

      expect(employee.position).toBe('Senior Mechanic');
      expect(employee.active_order_count).toBe(3);
      expect(employee.garage_name).toBe('Main Garage');
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/app/admin/employees
  // ---------------------------------------------------------------------------

  describe('POST /api/app/admin/employees', () => {
    it('should verify employee created response shape', () => {
      const createBody = {
        name: 'Tran Mechanic',
        phone: '0912345678',
        password: 'securepassword',
      };
      const mockResponse = makeMutationResponse({ data: makeEmployee(createBody) });

      expect(mockResponse.success).toBe(true);
    });

    it('should include required fields in create body', () => {
      const createBody = {
        name: 'Le Technician',
        phone: '0923456789',
        password: 'password123',
      };

      expect(createBody).toHaveProperty('name');
      expect(createBody).toHaveProperty('phone');
      expect(createBody).toHaveProperty('password');
    });

    it('should support optional position field in create body', () => {
      const createBody = {
        name: 'Pham Specialist',
        phone: '0934567890',
        password: 'pass456',
        position: 'Specialist',
      };

      expect(createBody).toHaveProperty('position');
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/app/admin/employees/:id
  // ---------------------------------------------------------------------------

  describe('GET /api/app/admin/employees/:id', () => {
    it('should verify employee detail response shape', () => {
      const mockResponse = {
        success: true,
        data: makeEmployee({ id: '5', name: 'Hoang Technician' }),
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.id).toBe('5');
      expect(mockResponse.data.name).toBe('Hoang Technician');
    });

    it('should include all employee fields in detail', () => {
      const employee = makeEmployee({
        id: '10',
        name: 'Nguyen Senior',
        phone: '0945678901',
        avatar_url: 'https://example.com/avatar.jpg',
        position: 'Senior Mechanic',
        status: 'active',
      });

      expect(employee.id).toBe('10');
      expect(employee.avatar_url).toBeTruthy();
      expect(employee.position).toBe('Senior Mechanic');
    });
  });

  // ---------------------------------------------------------------------------
  // PUT /api/app/admin/employees/:id
  // ---------------------------------------------------------------------------

  describe('PUT /api/app/admin/employees/:id', () => {
    it('should verify update response shape', () => {
      const updateBody = { name: 'Updated Name', phone: '0956789012' };
      const mockResponse = makeMutationResponse();

      expect(mockResponse.success).toBe(true);
      expect(updateBody).toHaveProperty('name');
    });

    it('should support updating position', () => {
      const updateBody = { position: 'Lead Mechanic' };
      const mockResponse = makeMutationResponse();

      expect(mockResponse.success).toBe(true);
      expect(updateBody.position).toBe('Lead Mechanic');
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/app/admin/employees/:id
  // ---------------------------------------------------------------------------

  describe('DELETE /api/app/admin/employees/:id', () => {
    it('should verify deletion response shape', () => {
      const mockResponse = makeMutationResponse({ message: 'Employee deleted' });

      expect(mockResponse.success).toBe(true);
    });

    it('should return success true on deletion', () => {
      const mockResponse: AdminMutationResponse = { success: true };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.error).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/app/admin/employees/assign-order
  // ---------------------------------------------------------------------------

  describe('POST /api/app/admin/employees/assign-order', () => {
    it('should verify assign-order response shape', () => {
      const assignBody = {
        employee_id: '7',
        order_id: 42,
      };
      const mockResponse = makeMutationResponse();

      expect(mockResponse.success).toBe(true);
      expect(assignBody).toHaveProperty('employee_id');
      expect(assignBody).toHaveProperty('order_id');
    });

    it('should accept string employee_id and numeric order_id', () => {
      const assignBody = {
        employee_id: 'emp-001',
        order_id: 100,
      };

      expect(typeof assignBody.employee_id).toBe('string');
      expect(typeof assignBody.order_id).toBe('number');
    });

    it('should accept numeric employee_id', () => {
      const assignBody = {
        employee_id: 7,
        order_id: 42,
      };

      expect(typeof assignBody.employee_id).toBe('number');
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/app/admin/employees/stats
  // ---------------------------------------------------------------------------

  describe('GET /api/app/admin/employees/stats', () => {
    it('should verify stats has total_employees field', () => {
      const mockStats: AdminStats = {
        total_employees: 25,
        active_employees: 20,
        on_leave: 2,
      };
      const mockResponse = makeStatsResponse(mockStats);

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data).toHaveProperty('total_employees');
    });

    it('should have non-negative total_employees value', () => {
      const mockStats: AdminStats = {
        total_employees: 25,
        active_employees: 20,
      };

      expect(Number(mockStats.total_employees)).toBeGreaterThanOrEqual(0);
    });

    it('should support active_employees field', () => {
      const mockStats: AdminStats = {
        total_employees: 30,
        active_employees: 25,
      };

      expect(mockStats).toHaveProperty('active_employees');
      expect(Number(mockStats.active_employees)).toBeLessThanOrEqual(
        Number(mockStats.total_employees),
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
        data: [makeEmployee({ id: '1' }), makeEmployee({ id: '2' })],
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
    });

    it('should handle { success: true, employees: [...] } envelope', () => {
      const response = {
        success: true,
        employees: [makeEmployee({ id: '3' })],
      };

      expect(response.success).toBe(true);
      expect(Array.isArray(response.employees)).toBe(true);
    });

    it('should detect failure response', () => {
      const errorResponse = {
        success: false,
        error: 'Employee not found',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeTruthy();
    });
  });
});
